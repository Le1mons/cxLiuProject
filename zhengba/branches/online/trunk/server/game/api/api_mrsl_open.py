#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
每日试练——开启
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _type = str(data[0])
    # 等级不足
    if not g.chkOpenCond(uid,'meirishilian'):
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsl_open_res_-1')
        return _res

    _lessNum = g.m.mrslfun.getLessNum(uid, _type)
    _maxNum = g.m.mrslfun.getMaxBuyNum(uid)
    _buyNum = g.m.mrslfun.getBuyNum(uid,_type)
    _res['d'] = {'lessnum': _lessNum, 'maxnum': _maxNum,'buynum':_buyNum}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao1')
    print doproc(g.debugConn, ['jinbi', 1])