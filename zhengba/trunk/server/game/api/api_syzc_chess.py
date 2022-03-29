#!/usr/bin/python
# coding:utf-8

import sys,random

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
噬渊战场 - 触发事件和走路
'''
def proc(conn, data,key=None):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 最后走到的格子id
    _gzid = str(data[0])

    # 走过的格子idlist
    _extgzid = data[1]



    # 判断是否开启
    if not g.chkOpenCond(uid, 'syzc'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData
    _con = dict(g.GC["syzccom"])
    _data = g.m.syzcfun.getData(uid)
    # 请先去重置
    _week = g.m.syzcfun.getWeek()
    if "week" not in _data or _data["week"] != _week:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData
    _chkData["setdata"] = {}

    _chkData["data"] = _data
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
    _data = _chkData["data"]
    # 最后走到的格子id
    _gzid = str(data[0])
    # 走过的格子idlist
    _extgzid = data[1]

    _setData = _chkData["setdata"]

    _data["opengzid"].extend(_extgzid)
    _data["opengzid"] = list(set(_data["opengzid"]))
    _setData["opengzid"] = _data["opengzid"]
    _setData["nowgzid"] = _gzid
    _data["nowgzid"] = _gzid
    g.m.syzcfun.setData(uid, _setData)
    _resData["mydata"] = _data

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = [82,  ["1"]]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'