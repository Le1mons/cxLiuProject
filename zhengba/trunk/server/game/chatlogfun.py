#!/usr/bin/python
# coding:utf-8

if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g
import urllib
import urllib2
import json


# 聊天日志相关
def saveLog(gud, content, mtype=-1, **kwargs):
    """


    :param gud: gud 发送方的gud信息
    :param content:
    :param mtype: channel 频道 -1 无频道 0 私聊 1为发送招募信息 2综合、3公会聊天，4 跨服聊天 5英雄评论
    :param kwargs: touid 发送给谁
    :return:
    """
    owner = ""
    if not gud:
        return

    try:
        nt = g.C.NOW()
        if "ext_owner" in gud:
            owner = gud["ext_owner"]

        d = {
            "game": "zhengba",
            "uid": gud["uid"],
            "name": gud["name"],
            "lv": gud["lv"],
            "vip": gud["vip"],
            "ctime": nt,
            "owner": owner,
            "channel": mtype,
            "sid": gud["sid"],
            "content": content,
            "ip": gud.get('lastloginip', ''),
            "ttltime": g.C.UTCNOW(),
            "uped": 0,
        }

        if 'touid' in kwargs:
            toGud = g.getGud(kwargs['touid'])
            toowner = ''
            if "ext_owner" in toGud:
                toowner = toGud["ext_owner"]
            d.update({
                'to': {
                    "game": "zhengba",
                    "uid": toGud["uid"],
                    "name": toGud["name"],
                    "lv": toGud["lv"],
                    "vip": toGud["vip"],
                    "ctime": nt,
                    "owner": toowner,
                    "channel": mtype,
                    "sid": toGud["sid"],
                }
            })

        g.mdb.insert("chatlog", d)
    except:
        pass


def uploadLog():
    try:
        rs = g.mdb.find("chatlog", {"uped": 0}, limit=50)
        if len(rs) > 0:
            ids = []
            ly = LongYuan()

            for r in rs:
                lyres = ly.chat(r)
                postToTanYan(r)
                ids.append(r['_id'])
                del r['_id']
                if 'ttltime' in r: del r['ttltime']

            data = {'log': g.minjson.write(rs)}
            data_urlencode = urllib.urlencode(data)
            requrl = "http://gamemana.legu.cc/index.php?g=admin&m=data&a=game_chat"
            req = urllib2.Request(url=requrl, data=data_urlencode)
            res_data = urllib2.urlopen(req)
            res = res_data.read()

            if res == 'success':
                g.mdb.update('chatlog', {'_id': {'$in': ids}}, {'uped': 1})
    except:
        pass

    g.tw.reactor.callLater(g.C.RANDINT(35, 90), uploadLog)


def isBlack(uid):
    """
    检查是否被屏蔽了 不论什么频道 只要在列表里面就封掉

    :param uid:
    :return: bool
    """
    nt = g.C.NOW()
    # 真禁言
    blList = g.m.dball.getBlackList(uid, where={'ctype': 2, 'etime': {'$gt': nt}}, keys="_id,uid,etime,ctype")
    if blList:
        return True
    return False

def postToTanYan(data):
    """

    :param data: dict chatlog 中的数据
    :return:
    给天眼发送数据
    天眼接口文档 http://admin.gamegs.cn/tests/help
    ::

        {
            "_id" : ObjectId("5d0c50befcd0777794047fd5"),
            "uid" : "0_5cd38383c0911a3a94c3476b",
            "ip" : "192.168.3.85",
            "owner" : "",
            "game" : "zhengba",
            "ttltime" : ISODate("2019-06-21T03:36:30.369Z"),
            "name" : "黯然兔兔",
            "ctime" : 1561088190,
            "content" : "【私聊】asas",
            "to" : {                                    # 可以没有
                "uid" : "0_5cd388dc9dc6d67a21c0f0aa",
                "name" : "丑陋迷糊",
                "game" : "zhengba",
                "sid" : 0,
                "owner" : "",
                "channel" : 0,
                "ctime" : 1561088190
            },
            "sid" : 0,
            "uped" : 0,
            "channel" : 0
        }

    :param data: dict
    :return:
    """

    # 50级以上不发送数据到天眼 英雄评论全部上报到天眼
    lv = data.get('lv', 0)
    channel_type = data.get('channel', 5)
    if lv >= 50 and channel_type != 5:
        return

    url = "http://gateway.gamegs.cn:8743/api/v1/chat/receive"
    tyid = "5a3b"

    # uid = data['uid']
    # gud = g.getGud(uid)

    chatTo = {}

    cto = data.get('to', {})
    if cto:
        chatTo = {
            'playerId': cto.get('uid', ''),
            'userId': cto.get('uid', ''),
            'nickname': cto.get('name', ''),
            'level': cto.get('lv', 0),
            'vipLevel': cto.get('vip', 0),
            'power': 0,
            'zoneId': str(cto.get('sid', '')),
            'zoneName': cto.get('owner', ''),
            'extra': None,
            'serverId': str(cto.get('sid', '')),
        }

    # 发送方
    chatFrom = {
        'playerId': data.get('uid', ''),
        'userId': data.get('uid', ''),
        'nickname': data.get('name', ''),
        'level': data.get('lv', 0),
        'vipLevel': data.get('vip', 0),
        'power': 0,
        'zoneId': str(data.get('sid', '')),
        'zoneName': data.get('owner', ''),
        'extra': None,
        'serverId': str(data.get('sid', '')),
    }

    jsonStr = {
        'channel': data.get('channel', -1),
        'content': data['content'],
        'ip': data.get('ip', ''),
        'extra': None,
        # 'to': chatTo,
        'from': chatFrom,
    }
    if chatTo:
        jsonStr.update({
            'to': chatTo
        })

    formate = {
        'id': tyid,
        'data': json.dumps(jsonStr)
    }

    data = urllib.urlencode(formate)

    # request = urllib2.Request(url, data=data, headers=headers)
    request = urllib2.Request(url, data=data)

    response = urllib2.urlopen(request)
    print response.read()


def tainYanRename(uid, name):
    """
    改名接口

    :param uid:
    :param name:
    :return:
    """
    gud = g.getGud(uid)

    url = "http://gateway.gamegs.cn:8743/api/v1/chat/player"
    tyid = "5a3b"

    jsonStr = {
        'playerId': gud.get('uid', ''),
        'userId': gud.get('uid', ''),
        'nickname': name,
        'level': gud.get('lv', 0),
        'vipLevel': gud.get('vip', 0),
        'power': gud.get('zhanli', 0),
        'zoneId': str(gud.get('sid', '')),
        'zoneName': gud.get('owner', ''),
        'extra': None,
        'serverId': str(gud.get('sid', '')),
    }


    formate = {
        'id': tyid,
        'data': json.dumps(jsonStr)
    }

    data = urllib.urlencode(formate)

    # request = urllib2.Request(url, data=data, headers=headers)
    request = urllib2.Request(url, data=data)

    response = urllib2.urlopen(request)
    print response.read()

class LongYuan(object):
    """
    龙渊聊天接口
    http://dragonest.com/



    """
    def __init__(self):
        # self._url = 'http://test-gtf.ai.dragonest.com'
        self._url = 'http://gtf.ai.dragonest.com'
        self._token = 'E32F5AA86C6B21DC'

    def detect_text(self, context, data_id, user_id, context_type='chat', **kwargs):
        """
        原始api

        {
            "data_id":"1",                  # 数据 id 客户端自定义，尽量保证 id 唯一性， 用于索引、标识待检测文本。
            "context":"加微信",              # 待检测文本 限定 500 个字符以内，文本长度超过500 个字符时，只检测前 500 个字符
            "context_type":"chat",          # 当前只支持“chat”，未来会扩展到其他类型，如：nick(用户名/昵称)、post（帖子）等游戏内其他文本内容形式。
            "token":"E32F5AA86C6B21DC",     # 接口调用的权限认证信息，在接入时进行分配。
            "user_id":"liu"                 # 发言用户标识
        }

        {
            "code": 0,                      # 0：表示成功。1：表示失败
            "data": {
                "label": "normal",          # 取值范围: 1. normal: 正常。 2. politics: 政治敏感。 3. terror: 暴恐违禁。 4. porn: 文本色情。5. ad：恶意推广。 6. curse: 咒骂敌视
                "suggestion": "pass"        # 取值范围： 1. pass: 通过。 2. review: 建议人工审核。 3. block: 文本不合规，建议屏蔽
            },
            "data_id": "1",                 # 与请求参数中的 data_id 一致
            "msg": "success"                # 错误描述信息 请求异常时，可根据此错误信息进行排查
        }

        :param context:
        :param data_id:
        :param context_type:
        :param user_id:
        :param kwargs:
        :return:
        """
        api_url = self._url + '/v1.0/game_chat_ban/detect_text'
        data = {
            "data_id": data_id,
            "context": context,
            "context_type": context_type,
            "token": self._token,
            "user_id": user_id
        }

        headers = {'Content-Type': 'application/json'}
        request = urllib2.Request(api_url, headers=headers, data=json.dumps(data))
        response = urllib2.urlopen(request)
        res = response.read()
        return res

    def chat(self, data, **kwargs):
        """

        :param context:
        :param data_id:
        :param user_id:
        :param context_type:
        :param kwargs:
        :return:
        """
        # 50级以上不发送数据到天眼
        lv = data.get('lv', 0)
        # if lv >= 50:
        #     return

        context = data.get('content')
        data_id = str(data.get('_id'))
        user_id = data.get('uid')
        res = self.detect_text(context, data_id, user_id)
        return res





if __name__ == '__main__':
    # uploadLog()
    from bson import ObjectId
    uid = '0_5cd38383c0911a3a94c3476b'
    # uploadLog()
    data = {
        "_id" : ObjectId("5e9686a5077b055ee77942a3"),
        "uid" : "80_5dc3bbba077b050f26451cb8",
        "ip" : "27.18.69.215",
        "game" : "geshouccs",
        "owner" : "geshouccs",
        "name" : "追猎者音乐",
        "content" : "必死",
        "ctime" : 1586923173,
        "vip" : 0,
        "lv" : 5,
        "sid" : 80,
        "uped" : 1,
        "channel" : 2
    }
    ly = LongYuan()
    res = ly.chat(data)

    exit()

    tainYanRename(uid, '改名了黯然兔兔')
    gud = g.getGud(uid)
    saveLog(gud, "aaa")
    a = isBlack(uid)
    print a
