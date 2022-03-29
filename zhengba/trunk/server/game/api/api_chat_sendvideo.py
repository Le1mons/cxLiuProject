#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
聊天-发送战斗录像
'''

def proc(conn, data, key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(conn, data):
    uid = conn.uid
    _chkData = {}
    _chkData["s"] = 1
    # 0是世界，1是跨服
    _mtype = int(data[0])
    _fightLogkey = data[1]
    _name = str(data[2])
    _hideVip = int(data[3])


    _nt = g.C.NOW()
    _lastTime = conn.sess.get(g.C.STR("msgtime_{1}", "sendvideo"))

    if _mtype not in [2, 4]:
        _chkData["s"] = -2
        _chkData["errmsg"] = g.L("chat_dendvideo_res_-2")
        return _chkData


    # 消息间隔
    _diffTime = {2: 300, 4: 300}
    if _lastTime != None and _nt - int(_lastTime) <= _diffTime[_mtype]:
        _chkData["s"] = -2
        _chkData["errmsg"] = g.L("chat_dendvideo_res_-1")
        return _chkData

    # 设置每日发送次数
    _num = g.getAttrByCtype(uid, "chat_sendvideo", default=0)
    if _num >= 10:
        _chkData["s"] = -3
        _chkData["errmsg"] = g.L("chat_send_-11")
        return _chkData


    _chkData["finghtkey"] = _fightLogkey
    _chkData["mtype"] = _mtype
    _chkData["name"] = _name
    _chkData["hidevip"] = _hideVip
    _chkData["num"] = _num
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(conn, data)
    if _chkData["s"] != 1:
        return _chkData

    _mtype = _chkData["mtype"]
    _fightKey = _chkData["finghtkey"]
    _name = _chkData["name"]
    _num = _chkData["num"]

    _nt = g.C.NOW()
    gud = g.getGud(uid)

    # _setData = {}
    # _setData["fightlog"] = _fightLog
    # # 存入数据库
    # g.crossDB.insert("chatfightlog", _setData)
    _fdata = {"uid": gud["uid"],
              "name": gud["name"],
              "lv": gud["lv"],
              "vip": gud.get("vip", 0),
              "ctime": _nt,
              "head": gud["head"],
              "sendType": 0,
              "sid": gud["sid"],
              "headborder": gud["headborder"],
              "chatborder": gud["chatborder"],
              "chenghao": gud["chenghao"],
              "hidevip": _chkData["hidevip"],
              'svrname': g.m.crosscomfun.getSNameBySid(gud["sid"]),
              "fightlog": _fightKey,
              "toname": _name
              }

    # _toName = _fightLog["headdata"][1]["name"]
    # _content = g.C.STR(g.L("sendvideo"), _toName)
    _content = ""

    # 如果是世界消息
    if _mtype == 2:
        g.m.chatfun.sendMsg(_content, _mtype, data=_fdata)
    else:
        _fdata["m"] = _content
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': _content, 'mtype': _mtype, 'fdata': _fdata, "extarg":{}})

    # 记录发送时间
    conn.sess.set(g.C.STR("msgtime_{1}", "sendvideo"), _nt)
    g.setAttr(uid, {"ctype": "chat_sendvideo"}, {"v": _num + 1})

    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('wlx1')
    g.debugConn.uid = uid
    _data = ['2', "fightlog934dde40"]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'