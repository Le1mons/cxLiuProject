# coding=utf-8
from datetime import datetime, timedelta
import functools
import hashlib
import json
import time
import threading
import traceback

import urllib2

import bson
import pymongo
from pymongo import InsertOne

if __name__ == '__main__':
    import sys

    sys.path.append('../game')
    import g

from settings import *


# **********************************************************************************************************************

def capture_error(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()

    return wrapper


def sort_kv(*args):
    return '&'.join(map(lambda item: '&'.join(map(lambda x: '{}={}'.format(x[0], x[1]), sorted(item.items()))), args))


def make_sign(salt='', *args):
    s = sort_kv(*args) + salt
    return hashlib.md5(s.encode()).hexdigest()


def field_map(data):
    res = dict()

    for k, v in data.items():
        if isinstance(v, dict):
            res[k] = field_map(v)
        else:
            res[FIELD_MAP.get(k) or k] = v
    return res


def url_post(url, data, try_cnt=3):
    try:
        headers = {
            "Content-Type": "application/json",
            "Charset": "UTF-8"
        }
        request = urllib2.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
        response = urllib2.urlopen(request, timeout=10)
        return json.loads(response.read())
    except Exception as e:
        if try_cnt > 0:
            return url_post(url, data, try_cnt - 1)
        else:
            return json.dumps({'code': '-2', 'msg': e})


# **********************************************************************************************************************


class MdbConsumer(object):
    """
    批量写入mdb
    """

    def __init__(self, coll):
        self.coll = coll
        self.last_ts = int(time.time())
        self.bulk_data = []
        # if '#time_-1' not in coll.index_information():
        #     # coll.create_index([("#time", pymongo.DESCENDING)], background=True, expireAfterSeconds=86400 * 30)
        #     print '%s 建议加 #time 逆序索引' % coll.name

    def add(self, data):
        ts = int(time.time())
        self.bulk_data.append(InsertOne(data))
        # 满足条件之一 写入mongo
        if data.get('#event_name') == 'pay' \
                or len(self.bulk_data) >= WRITE_LIMIT \
                or self.last_ts + BLOCK_EXPIRE <= ts:
            self.coll.bulk_write(self.bulk_data, ordered=False)
            self.bulk_data = []
            self.last_ts = ts

    def flush(self):
        self.coll.bulk_write(self.bulk_data, ordered=False)
        self.bulk_data = []


class DebugConsumer(object):
    """

    """

    def add(self, data):
        print data

    def flush(self):
        pass


# **********************************************************************************************************************

class Mdb2X(object):
    """
    定时发送
    """

    def __init__(self, coll, server_url=SERVER_URL,internal_timer=False):
        """

        :param coll: 数据缓存集合
        :param server_url: 上报地址
        """
        self.coll = coll
        self.server_url = server_url
        self.internal_timer = internal_timer

    def read_data(self):
        """
        从集合读出数据按uid分组
        :return:
        """
        # 取近3天 未上报  1000条
        where = {
            'create_date': {'$gte': datetime.utcnow() - timedelta(days=3)},
            'isupload': {'$exists': False}
        }
        cursor = self.coll.find(where).sort([("create_date", -1)]).limit(1000)
        msg = dict()
        del_ids = dict()
        for item in cursor:
            account_id = item['#account_id']
            del_ids.setdefault(account_id, set())
            del_ids[account_id].add(item.pop('_id'))

            msg.setdefault(account_id, {'public': {}, 'data': []})
            single_data = {
                '#type': item.pop('#type'),
                '#event_name': item.pop('#event_name'),
                '#time': item.pop('#time'),
                '#os': 'server'
            }
            if item['properties'].get('#ip'):
                single_data['#ip'] = item['properties'].pop('#ip')
            properties = item.pop('properties')

            # 列表类型 签名需要join处理
            sign_properties = dict()
            for k, v in properties.items():
                if isinstance(v, bson.int64.Int64):
                    v = int(v)
                    properties[k] = v

                if isinstance(v, list):
                    sign_properties[k] = ','.join(map(lambda x: str(x), v))

                else:
                    sign_properties[k] = v
            sign = make_sign(APPKEY, single_data, sign_properties)

            for k, v in item.items():
                if k.startswith('#'):
                    msg[account_id]['public'][k] = v

            single_data['properties'] = properties
            single_data['sign'] = sign

            single_data = field_map(single_data)
            msg[account_id]['data'].append(single_data)

        return field_map(msg), del_ids

    @capture_error
    def send(self):
        """

        :return:
        """
        try:
            data, del_ids = self.read_data()
            for account_id, item in data.items():
                resp = url_post(self.server_url, item)
                # 上报成功删除缓存数据
                if resp.get('code') == 0:
                    self.coll.update_many({'_id': {'$in': list(del_ids[account_id])}}, {'$set': {'isupload': True}})
                else:
                    print resp
        except Exception as e:
            traceback.print_exc()
        if self.internal_timer:
            timer = threading.Timer(BLOCK_EXPIRE, self.send)
            timer.name = 'postXdata'
            timer.start()


# **********************************************************************************************************************


class XData(object):
    """
    结构化数据往consumer 添加
    """

    def __init__(self, consumer, super_properties_call=None):
        """

        :param consumer: 消费数据
        :param super_properties_call: 公有属性回调
        """
        self.consumer = consumer
        self.super_properties_call = super_properties_call

    def __set_super_properties(self, type_, event_name, account_id, properties):
        if type_ == 'user' and event_name not in ('set', 'setOnce'):
            return
        super_properties = self.super_properties_call(account_id)
        for k in SUPER_PROPERTIES:
            v = super_properties.get(k)
            if v is not None:
                properties[SUPER_PROPERTIES[k]] = v

    def __add(self, type_, distinct_id=None, account_id=None, event_name=None, data=None):
        """
        user_add
        :param type_:
        :param distinct_id:
        :param account_id:
        :param event_name:
        :param data:
        :return:
        """
        msg = dict()
        msg['#account_id'] = account_id

        msg['#type'] = type_
        msg['#app_id'] = APPID
        msg['#event_name'] = event_name
        msg['#time'] = int(time.time())
        data['game'] = GAME
        msg['properties'] = data
        # ttl
        msg['create_date'] = datetime.utcnow()
        if account_id and self.super_properties_call:
            self.__set_super_properties(type_, event_name, account_id, msg['properties'])

        first_device_id = msg.get('properties', dict()).get('first_device_id')
        msg['#distinct_id'] = distinct_id or first_device_id

        self.consumer.add(msg)

    @capture_error
    def track(self, distinct_id=None, account_id=None, event_name=None, data=None):
        """

        :param distinct_id: 访客id
        :param account_id: 唯一id
        :param event_name: 事件名
        :param data: 自定义属性
        :return:
        """
        if not (distinct_id or account_id):
            raise ValueError("请提供用户标识")

        if not isinstance(event_name, str):
            raise ValueError("请提供正确的事件名")
        if not isinstance(data, dict):
            raise ValueError("请提供字典类型")

        self.__add('track', distinct_id, account_id, event_name, data)

    @capture_error
    def track_update(self, distinct_id=None, account_id=None, event_name=None, data=None):
        """
        可更新事件  data 字典必须包含event_id
        :param distinct_id: 访客id
        :param account_id: 唯一id
        :param event_name: 事件名
        :param data: 自定义属性
        :return:
        """
        if not (distinct_id or account_id):
            raise ValueError("请提供用户标识")
        if not isinstance(event_name, str):
            raise ValueError("请提供正确的事件名")
        if not isinstance(data, dict):
            raise ValueError("请提供字典类型")
        if not isinstance(data.get('event_id'), str):
            raise ValueError("请提供事件id")
        self.__add('track_update', distinct_id, account_id, event_name, data)

    @capture_error
    def track_overwrite(self, distinct_id=None, account_id=None, event_name=None, data=None):
        """
        可重写事件  data 字典必须包含event_id
        :param distinct_id: 访客id
        :param account_id: 唯一id
        :param event_name: 事件名
        :param data: 自定义属性
        :return:
        """
        if not (distinct_id or account_id):
            raise ValueError("请提供用户标识")
        if not isinstance(event_name, str):
            raise ValueError("请提供正确的事件名")
        if not isinstance(data, dict):
            raise ValueError("请提供字典类型")
        if not isinstance(data.get('event_id'), str):
            raise ValueError("请提供事件id")
        self.__add('track_overwrite', distinct_id, account_id, event_name, data)

    @capture_error
    def user(self, distinct_id=None, account_id=None, act=None, data=None):
        """

        :param distinct_id: 访客id
        :param account_id: 唯一id
        :param act: 操作
        :param data: 自定义属性
        :return:
        """

        if not (distinct_id or account_id):
            raise ValueError("请提供用户标识")

        if act not in USER_ACT:
            raise ValueError("用户属性操作必须是", USER_ACT)
        if not isinstance(data, dict):
            raise ValueError("请提供字典类型")
        self.__add('user', distinct_id, account_id, act, data)

    @capture_error
    def flush(self):
        self.consumer.flush()


if __name__ == '__main__':
    xLog = XData(MdbConsumer(g.mdb.mongodb.get_collection('xlog')), g.getGud)  # 打点数据
    try:
        xLog.track(account_id='0_5e8e7c739dc6d64d2395f5c3', event_name='pay',
                   data={'money': 1,
                         'proid': 'yueka',
                         'unitPrice': 100,
                         'orderid': 'sdfff',
                         'islishishouci': 1,
                         'isdangrishouci': 1})
    except Exception as e:
        print e
    Mdb2X(g.mdb.mongodb['xlog']).send()
