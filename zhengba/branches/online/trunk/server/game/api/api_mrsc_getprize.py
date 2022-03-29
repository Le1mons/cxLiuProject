#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g
import huodong
'''
获取客户端动态按钮
'''
def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _scData = g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive')
    # 没有今日充值信息
    if not _scData:
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsc_getprize_-1')
        return _res

    _con = g.GC['meirishouchong']
    _val = _scData[0]['v']
    # 充值金额不足以领取
    if _val < _con['val']:
        _res['s'] = -2
        _res['errmsg'] = g.L('mrsc_getprize_-2')
        return _res

    # 奖励已领取
    if 'receive' in _scData[0]:
        _res['s'] = -3
        _res['errmsg'] = g.L('mrsc_getprize_-3')
        return _res

    g.setAttr(uid, {'ctype': 'meirishouchong'}, {'receive':1})
    _prize = _con['prize']
    _sendData = g.getPrizeRes(uid, _prize, {'act':'mrsc_getprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res