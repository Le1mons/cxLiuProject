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




    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _week = g.m.syzcfun.getWeek()

    _list = g.mdb.find("syzc_fightlog", {"uid": uid, "week": _week}, fields=["winside", "uid", "myzhanli", "rivalheaddata", "headdata", "rivalzhanli","ctime", "layer", "eid"])
    _loglist = []
    for i in _list:
        i["tid"] = str(i["_id"])
        del i["_id"]
        _loglist.append(i)

    _resData = {}
    _resData["loglist"] = _loglist

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('1')
    g.debugConn.uid = uid
    _data = [['5dbbe9f40ae9fe0900d72d70']]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'