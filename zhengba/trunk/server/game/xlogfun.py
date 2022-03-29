#!/usr/bin/python
# coding:utf-8

"""
x数据平台数据上报逻辑
上报userinfo和paylist的数据
上报xlog中的数据

合区的时候需要清理掉 gameconfig {'ctype':'XLOG_UPLOAD_CONF'}

todo 队列上报

"""
import hashlib
import json
import copy

if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g
import urllib
import urllib2

# 锁定上报 避免重复上报
_xlog_lock_key_ = {'user': 0, 'paylist': 0, 'xlog': 0}


def getConf():
    """
    获取上报需要的配置 xlog {'ctype':'upload_conf'}

    :return:
    """
    upload_conf = g.mdb.find1('gameconfig', {'ctype': 'XLOG_UPLOAD_CONF'}, fields={'_id': False})
    if not upload_conf:
        upload_conf = dict(g.GC['xlog'])
        g.mdb.update('gameconfig', {'ctype': 'XLOG_UPLOAD_CONF'}, {'$set': upload_conf}, upsert=True)
    return upload_conf


def xlogLock(act):
    """
    锁定上报 在上报的时候

    :param act: str user paylist xlog
    :return:
    """
    nt = g.C.NOW()
    if act in _xlog_lock_key_:
        _xlog_lock_key_[act] = nt


def xlogUnLock(act):
    """

    :param act: str
    :return:
    """
    if act in _xlog_lock_key_:
        _xlog_lock_key_[act] = 0


def xlogIsLock(act):
    """

    :param act:
    :return:
    """
    if act in _xlog_lock_key_:
        return _xlog_lock_key_[act]
    return False


def uploadUser(uid, data, event='set', event_act=''):
    """
    g.m.xlogfun.uploadUser(uid, data)

    :param uid:
    :param data: dict
    :param event: str set set_once
    :param event_act: str
    :return:
    """

    xLogInsert(uid, 'user', data, event, event_act)


def uploadEvent(uid, data, event, event_act=''):
    """
    g.m.xlogfun.uploadEvent(uid, data)

    :param uid:
    :param data: dict
    :param event: str xxevent
    :param event_act: str
    :return:
    """

    xLogInsert(uid, 'event', data, event, event_act)


def xLogInsert(uid, ctype, data, event=None, event_act=''):
    """
    用于记录的库 每十分钟会上传数据 22-3不上报

    :param uid:
    :param ctype: str user event
    :param data: dict
    :param event: str set set_once xxevent ctype是event的时候要设置event
    :return:
    """
    nt = g.C.NOW()
    gud = g.getGud(uid)

    updata_data = {}

    xlog_conf = g.GC['xlog']

    _event = 'set'
    if ctype == 'event':
        _event = event

    insertData = {
        'ctime': nt,
        'ctype': ctype,
        "event": _event,
        "event_act": event_act,
        'props': {
            '_event_time': nt,
            '_device_id': gud.get('ext_device_id', ''),
            '_first_device_id': gud.get('ext_first_device_id', ''),
            '_channel_uid': gud.get('ext_channel_uid', ''),
            '_owner_name': gud.get('ext_owner', ''),
            '_channel_name': gud.get('ext_channel', ''),
            '_district_server_id': gud.get('sid', ''),
            '_game_role_id': uid
        },
    }

    for k, v in data.items():
        if k in xlog_conf['user_upload_key']:
            updata_data[xlog_conf['user_upload_key'][k]] = v
        else:
            updata_data[k] = v

    insertData['props'].update(updata_data)
    oid = g.mdb.insert('xlog', insertData)


def postXlog():
    """

    :return:
    """

    if g.getGameVer() == 'debug':
        return

    type_key = 'xlog'
    xlog_conf = getConf()
    if xlogIsLock(type_key):
        print 'postXlog lock'
        return
    try:
        postXlogUser()
        postXlogEvent()
    except Exception as e:
        xlogUnLock(type_key)
        print 'postXlog error', e

    g.tw.reactor.callLater(xlog_conf[type_key + '_conf']['callLater'], postXlog)



def postXlogUser():
    """
    上报xlog的用户修改数据 会对用户的数据进行合并 目前只会有set

    :return:
    """

    xlog_conf = getConf()
    try:
        nt = g.C.NOW()

        userUrl = xlog_conf['url'] + '/v2/game/user'
        user_upload_key = xlog_conf['user_upload_key']

        limit_conf = xlog_conf['xlog_conf']['limit']

        all_log = g.mdb.find('xlog', {'ctype': 'user'}, limit=limit_conf)
        uid_data = {}
        for _log in all_log:
            uid = _log['props']['_game_role_id']
            if uid not in uid_data:
                uid_data[uid] = [_log]
            else:
                uid_data[uid].append(_log)


        del_id_list = []
        for _uid, _logs in uid_data.items():
            # 根据时间排序 最新的时间产生的数据会覆盖老的数据
            _logs.sort(key=lambda ele:ele['ctime'])
            _nt = g.C.NOW()
            appid = xlog_conf['appid']
            project = xlog_conf['project']
            type_ = 'user'
            event = 'set'
            event_act = ''
            gud = g.getGud(_uid)
            data = {
                'appid': appid,
                'project': project,
                'type': type_,
                'event': event,
                'event_act': event_act,
                'sign': '',
                'timestamp': _nt,
                'props': {
                    '_event_time': nt,
                    '_device_id': gud.get('ext_device_id', ''),
                    '_first_device_id': gud.get('ext_first_device_id', ''),
                    '_channel_uid': gud.get('ext_channel_uid', ''),
                    '_owner_name': gud.get('ext_owner', ''),
                    '_channel_name': gud.get('ext_channel', ''),
                    '_district_server_id': gud.get('sid', ''),
                    '_game_role_id': _uid
                }
            }
            props_data = {}
            del_uid_id_list = []
            for _log in _logs:
                del_uid_id_list.append(_log['_id'])
                props_data.update(_log['props'])

            for k, v in props_data.items():
                if k in xlog_conf['user_upload_key']:
                    data['props'][xlog_conf['user_upload_key'][k]] = v
                else:
                    data['props'][k] = v


            # 签名
            m = hashlib.md5()
            # m.update((str(appid) + project + type + event + str(timestamp) + props_str + g.secret_token).encode('utf8'))
            m.update((str(appid) + project + type_ + event + event_act + str(_nt) + xlog_conf['secret_token']).encode('utf8'))
            # m.update((appid + project + str(timestamp) + api_secret).encode('utf8'))
            sign = m.hexdigest()
            data['sign'] = sign

            postRes = urlPost(userUrl, data)
            postJsonRes = json.loads(postRes)

            if postJsonRes.get('code') == 1:
                del_id_list.extend(del_uid_id_list)
            else:
                print 'postXlogUser res error', postJsonRes


        if del_id_list:
            res = g.mdb.delete('xlog', {'_id': {'$in': del_id_list}})


    except Exception as e:
        print 'postXlogUser error', e

    # g.tw.reactor.callLater(xlog_conf[type_key + '_conf']['callLater'], postUser)


def postXlogEvent():
    """
    上报xlog的event数据

    :return:
    """
    type_key = 'xlog'
    xlog_conf = getConf()
    try:
        nt = g.C.NOW()

        userUrl = xlog_conf['url'] + '/v2/game/event'

        limit_conf = xlog_conf['xlog_conf']['limit']

        all_log = g.mdb.find('xlog', {'ctype': 'event'}, limit=limit_conf)
        del_id_list = []
        for _log in all_log:
            _nt = g.C.NOW()
            appid = xlog_conf['appid']
            project = xlog_conf['project']
            type_ = 'event'
            event = _log['event']
            event_act = _log.get('event_act', '')
            data = {
                'appid': appid,
                'project': project,
                'type': type_,
                'event': event,
                'event_act': event_act,
                'sign': '',
                'timestamp': _nt,
                'props': {
                    # '_event_time': _nt,
                }
            }

            data['props'].update(_log['props'])

            # 签名
            m = hashlib.md5()
            # m.update((str(appid) + project + type + event + str(timestamp) + props_str + g.secret_token).encode('utf8'))
            m.update((str(appid) + project + type_ + event + event_act + str(_nt) + xlog_conf['secret_token']).encode(
                'utf8'))
            # m.update((appid + project + str(timestamp) + api_secret).encode('utf8'))
            sign = m.hexdigest()
            data['sign'] = sign

            postRes = urlPost(userUrl, data)
            postJsonRes = json.loads(postRes)
            if postJsonRes.get('code') == 1:
                del_id_list.append(_log['_id'])
            else:
                print 'postXlogEvent res error', postJsonRes

        if del_id_list:
            res = g.mdb.delete('xlog', {'_id': {'$in': del_id_list}})


    except Exception as e:
        print 'postXlogEvent error', e

    # g.tw.reactor.callLater(xlog_conf[type_key + '_conf']['callLater'], postUser)


def postUser():
    """
    每隔一段时间上报user中的数据

    :return:
    """
    if g.getGameVer() == 'debug':
        return

    type_key = 'user'
    xlog_conf = getConf()
    try:
        nt = g.C.NOW()

        userUrl = xlog_conf['url'] + '/v2/game/user'
        user_upload_key = xlog_conf['user_upload_key']

        if xlogIsLock(type_key):
            return

        xlogLock(type_key)

        limit_conf = xlog_conf['user_conf']['limit']

        all_user = g.mdb.find('userinfo', {'isupload': {'$exists': False}}, limit=limit_conf)
        for _user in all_user:
            _nt = g.C.NOW()
            appid = xlog_conf['appid']
            project = xlog_conf['project']
            type_ = 'user'
            event = 'set'
            event_act = ''
            data = {
                'appid': appid,
                'project': project,
                'type': type_,
                'event': event,
                'event_act': event_act,
                'sign': '',
                'timestamp': _nt,
                'props': {
                    '_event_time': _nt,
                    'ver': 'dev'
                }
            }
            is_first_device_id = False
            for k, v in user_upload_key.items():
                if k == 'ext_first_device_id':
                    is_first_device_id = _user.get(k, '')

                data['props'][v] = _user.get(k, '')

            # 签名
            m = hashlib.md5()
            # m.update((str(appid) + project + type + event + str(timestamp) + props_str + g.secret_token).encode('utf8'))
            m.update((str(appid) + project + type_ + event + event_act + str(_nt) + xlog_conf['secret_token']).encode(
                'utf8'))
            # m.update((appid + project + str(timestamp) + api_secret).encode('utf8'))
            sign = m.hexdigest()
            data['sign'] = sign

            postRes = urlPost(userUrl, data)
            postJsonRes = json.loads(postRes)

            if postJsonRes.get('code') == 1:
                g.mdb.update('userinfo', {'_id': _user['_id']}, {'$set': {'isupload': 1}})
            else:
                print 'postUser res error', postJsonRes
                continue
            # 上报但是不记录 下次还会上报
            # if not is_first_device_id:
            #     continue

        xlogUnLock(type_key)

    except Exception as e:
        xlogUnLock(type_key)
        print 'xpostuser error', e

    g.tw.reactor.callLater(xlog_conf[type_key + '_conf']['callLater'], postUser)


def postPayList():
    """
    每隔一段时间上报paylist中的数据

    :return:
    """

    if g.getGameVer() == 'debug':
        return

    type_key = 'paylist'
    xlog_conf = getConf()
    try:
        nt = g.C.NOW()
        userUrl = xlog_conf['url'] + '/v2/game/paylist'
        main_upload_key = xlog_conf['main_upload_key']

        if xlogIsLock(type_key):
            return

        xlogLock(type_key)

        limit_conf = xlog_conf['paylist_conf']['limit']

        all_paylist = g.mdb.find('paylist', {'isupload': {'$exists': False}}, limit=limit_conf)
        for _pay in all_paylist:
            _nt = g.C.NOW()
            uid = _pay['uid']
            appid = xlog_conf['appid']
            project = xlog_conf['project']
            type_ = 'paylist'
            event = 'set'
            event_act = ''
            gud = g.getGud(uid)
            _device_id = gud.get('ext_device_id', '')
            _first_device_id = gud.get('ext_first_device_id', _device_id)
            data = {
                'appid': appid,
                'project': project,
                'type': type_,
                'event': event,
                'event_act': event_act,
                'sign': '',
                'timestamp': _nt,
                'props': {
                    '_event_time': _pay['ctime'],
                    '_device_id': _device_id,
                    '_first_device_id': _first_device_id,
                    'money': int(_pay['money']),
                    'proid': _pay['proid'],
                    'orderid': _pay['orderid'],
                }
            }
            for k, v in main_upload_key.items():
                if v in data['props']:
                    continue
                data['props'][v] = gud.get(k, '')

            # 签名
            m = hashlib.md5()
            # m.update((str(appid) + project + type + event + str(timestamp) + props_str + g.secret_token).encode('utf8'))
            m.update((str(appid) + project + type_ + event + event_act + str(_nt) + xlog_conf['secret_token']).encode(
                'utf8'))
            # m.update((appid + project + str(timestamp) + api_secret).encode('utf8'))
            sign = m.hexdigest()
            data['sign'] = sign

            postRes = urlPost(userUrl, data)
            postJsonRes = json.loads(postRes)
            if postJsonRes.get('code') == 1:
                g.mdb.update('paylist', {'_id': _pay['_id']}, {'$set': {'isupload': 1}})
            else:
                print 'postPayList res error', postJsonRes
                continue

        xlogUnLock(type_key)

    except Exception as e:
        xlogUnLock(type_key)
        print 'xpostpaylist error', e

    g.tw.reactor.callLater(xlog_conf[type_key + '_conf']['callLater'], postPayList)


def urlPost(url, data):
    """
    http post

    :param url:
    :param data: dict
    :return:
    """

    try:
        headers = {
            "Content-Type": "application/json",
            "Charset": "UTF-8"
        }
        sendData = json.dumps(data)
        sendData = sendData.encode("utf-8")

        request = urllib2.Request(url, data=sendData, headers=headers)
        response = urllib2.urlopen(request, timeout=10)
    except Exception as e:
        print 'urlPost', e
        return json.dumps({'res': 'error', 'msg': e})

    return response.read()

from leguXsdk import xsdk
toup = xsdk.Mdb2X(g.mdb.mongodb['xlog'])

if __name__ == '__main__':
    # res = postUser()
    # res = postPayList()
    # res = getConf()
    # rs = xLogInsert('0_5ec3dd5a9dc6d61ef29d782c', 'user', {'liu':'ss','ext_device_id':'ddsdfs','lv':100},'set')
    # rs = xLogInsert('0_5ec3dd5a9dc6d61ef29d782c', 'event', {'liu': 'ss', 'ext_device_id': 'ddsdfs', 'lv': 100},'xxevent')
    # res = uploadEvent('0_5ec3dd5a9dc6d61ef29d782c',{'liu': 'ss', 'ext_device_id': 'ddsdfs', 'lv': 100},'liu')
    # res = uploadUser('0_5ec3dd5a9dc6d61ef29d782c',{'liu1': 'ss1', 'ext_device_id': 'ddsdfs', 'lv': 104})
    # res = postXlogEvent()
    # res = postXlogUser()
    postXlog()
    # g.tw.reactor.run()






