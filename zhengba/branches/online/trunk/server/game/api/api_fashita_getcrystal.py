#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
法师塔 - 获取法术结晶
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _cdSize = g.GC['fashitacom']['cd']
    # 结晶数量
    _jiejingInfo = g.m.fashitafun.getJieJingNum(uid,getcd=1)
    if _jiejingInfo['freetime'] != 0:
        _jiejingInfo['freetime'] += _cdSize


    _res['d'] = {'jiejing': _jiejingInfo}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, data=[1])
