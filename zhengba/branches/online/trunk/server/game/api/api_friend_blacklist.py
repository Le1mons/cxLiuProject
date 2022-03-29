#!/usr/bin/python
# coding: utf-8
'''
好友——黑名单
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _blackList = g.m.friendfun.getShieldList(uid)
    _resData = map(g.m.userfun.getShowHead, _blackList)
    _res['d'] = {'blacklist': _resData}
    return _res

    
if __name__ == '__main__':
    uid = g.buid("lsq2")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1012","1"])