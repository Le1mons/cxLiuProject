#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
祭坛——开启界面
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _data = g.m.jitanfun.getOpenInfo(uid)
    _jifen = g.m.jitanfun.getJitanJifen(uid)
    _res['d'] = _data
    _res['d'].update({'jifen':_jifen})
    return _res

if __name__ == '__main__':
    uid = g.buid("6")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])