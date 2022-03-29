#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
英雄——增加格子
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _geziInfo = g.m.userfun.getGeziNum(uid)
    _res['d'] = _geziInfo
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])