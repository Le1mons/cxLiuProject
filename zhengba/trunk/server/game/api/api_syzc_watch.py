#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
噬渊战场 - 日志列表
'''
def proc(conn, data,key=None):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _tid = data[0]
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


    _tid = data[0]
    _week = g.m.syzcfun.getWeek()
    _loginfo = g.mdb.find("syzc_fightlog", {"uid": uid, "_id": g.mdb.toObjectId(_tid)}, fields=["_id"])
    _resData = {}
    _resData = _loginfo

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = [['61a046e52a1f146e501816b8']]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'