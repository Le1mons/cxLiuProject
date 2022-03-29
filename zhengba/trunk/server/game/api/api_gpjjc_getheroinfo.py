#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-获取英雄数据
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1
    _hid = str(data[0])

    # # 获取公平竞技场是否开启
    # _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    # if not _chkOpen["act"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData

    # 获取玩家匹配数据
    _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id,jifen,tq,winnum,fightnum,uid,shipin,baoshi,lock,skin')

    _chkData["myinfo"] = _myinfo
    _chkData["hid"] = _hid
    return _chkData



@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _myinfo = _chkData["myinfo"]
    _hid = _chkData["hid"]

    _herodata = {"lv":300, "star": 14, "buff": {}, "dengjielv": 14, "hid":_hid}
    _con = g.GC["gongpingjjc"]["default"]
    _herodata["baoshi"] = _myinfo["baoshi"].get(_hid, _con["baoshi"])
    _herodata["shipin"] = _myinfo["shipin"].get(_hid, _con["shipin"])
    if _myinfo["skin"].get(_hid, ""):
        _herodata["skin"] = {"sid": _myinfo["skin"][_hid], "expire": -1, "tid": ""}
    # 获取当前装备的buff
    _herodata["buff"] = g.m.gongpingjjcfun.getBuff(_herodata)
    # 获取英雄数据
    _heroInfo = g.m.gongpingjjcfun.makeHeroBuff(_herodata)




    _resData["heroinfo"] = _heroInfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('xiaoxiannv')
    print g.debugConn.uid
    _data = ['11096']
    print doproc(g.debugConn,_data)