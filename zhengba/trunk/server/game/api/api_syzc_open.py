#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
噬渊战场 - open
'''
def proc(conn, data,key=None):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 判断是否开启
    if not g.chkOpenCond(uid, 'syzc'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    _data = g.m.syzcfun.getData(uid)
    _nt = g.C.NOW()
    # 请先去重置
    _week = g.m.syzcfun.getWeek()
    if "week" not in _data or _data["week"] != _week:
        _chkData["s"] = -2
        _chkData["d"] = {}
        _chkData["d"]["isstart"] = 0
        _chkData["d"]["layer"] = _data["layer"]
        return _chkData
    _chkData["data"] = _data
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _data = _chkData["data"]

    _resData = {}


    _resData["mydata"] = _data
    # 是否开启
    _resData["isstart"] = 1
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('lcx7')
    g.debugConn.uid = uid
    _data = [['5dbbe9f40ae9fe0900d72d70']]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'