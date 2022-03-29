#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')
sys.path.append('game')
import g



def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    act = 1
    if not g.m.kfkhfun.checkIsOpen(uid):
        act = 0
    _opTime = g.getOpenTime()
    etime = _opTime + 7*30*3600
    _res["d"] = {"act":act,"etime":etime}
    return _res


if __name__ == "__main__":
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])





