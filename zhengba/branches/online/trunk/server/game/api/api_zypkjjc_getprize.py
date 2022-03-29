#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g
'''
竞技场 - fight
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _idx = int(data[0])
    # 参数有误
    if _idx < 0 or _idx > len(g.GC['zypkjjccom']['base']['passprize']):
        _res['s'] = -101
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _prizeList = g.m.zypkjjcfun.getRecPrizeByWeek(uid)
    # 已经领取过
    if _idx in _prizeList:
        _res['s'] = -1
        _res['errmsg'] = g.L('zypkjjc_getprize_res_-1')
        return _res

    _con = g.GC['zypkjjccom']['base']['passprize'][_idx]
    _idx2Num = _con[0][0]
    _pkNum = g.m.zypkjjcfun.getPkNumByWeek(uid)
    # 领取的号码小于挑战次数
    if _idx2Num > _pkNum:
        _res['s'] = -2
        _res['errmsg'] = g.L('zypkjjc_getprize_res_-1')
        return _res

    _prizeList.append(_idx)
    g.m.zypkjjcfun.setRecPrizeByWeek(uid, _idx)
    _prize = _con[1]
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'zypkjjc_getprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])