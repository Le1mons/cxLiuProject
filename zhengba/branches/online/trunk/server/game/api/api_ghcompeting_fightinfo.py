#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公会争锋 - 公会战斗信息
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _season = g.m.competingfun.getSeasonNum()
    _res['d'] = g.m.competingfun.getGuildFightInfo(gud['ghid'], _season)
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq6")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])