#!/usr/bin/python
#coding:utf-8

'''
百川消息检测相关方法
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")
    
import g
import json
import urllib2
TASKLIST = {}


app_id = "VZP7IPgmIZW1wyUg"

token = "3fgnnBy4GgymmrqTdGTD"


def addTask(type, msg):
    _owner = g.getOwner()
    _con = g.GC["support"]["baichuan"]
    if _owner not in _con:
        return

    _ckey = "baichuantask_{}".format(type)
    _data = g.mc.get(_ckey) or []
    _data.append({"text": msg})
    g.mc.set(_ckey, _data)


def send():
    import base64
    import hashlib
    import hmac
    import time

    ts = int(time.time() * 1000)
    encode_string = "%s\n%s\n%s" % (app_id, ts, token)
    encode_byte = hmac.new(token.encode("utf-8"), encode_string.encode("utf-8"),
                           hashlib.sha1).digest()
    _sign = base64.urlsafe_b64encode(encode_byte).decode("utf-8")


    headers = {
        "Method": "POST",
        "Content-Type": "application/json",
        "Charset": "UTF-8"
    }

    _url = "https://censor.baichuanshuan.com/v1/text/scan?appId={}&sign={}&timestamp={}"
    _url = _url.format(app_id, _sign, ts)

    for type in ("msg", "changename",):
        _ckey = "baichuantask_{}".format(type)
        tasks = g.mc.get(_ckey) or []
        data = {}
        data["bizType"] = type
        _size = len(tasks)
        num, _ = divmod(_size, 10)
        if _ > 0:
            num += 1
        for i in xrange(num):
            data["tasks"] = tasks[num:num + 10]
            urlPost(_url, data)
        g.mc.delete(_ckey)



def urlPost(url, data):
    """
    http post

    :param url:
    :param data: dict
    :return:
    """


    headers = {
        "Method": "POST",
        "Content-Type": "application/json",
        "Charset": "UTF-8"
    }

    try:
        request = urllib2.Request(url=url, headers=headers, data=json.dumps(data))
        response = urllib2.urlopen(request, timeout=5)
    except Exception as e:
        print 'urlPost', e
        return json.dumps({'res': 'error', 'msg': e})

    return response.read()


if __name__ == "__main__":
    uid = g.buid("gch")
    gud = g.getGud(uid)
    addTask("changename", "啊啊啊啊啊")
    send()

    # print chkIfShouchongPrize(uid, 30)