#!/usr/bin/python
# coding: utf-8
'''
探险——探险主界面信息
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _main = g.m.tanxianfun.getTanXianMain(uid)
    _res['d'] = _main
    return _res

if __name__ == '__main__':
    uid = g.buid("14")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=["5aec5828625aee63808d3114"])
    g.mdb.update('hero',{'uid':uid,'star':6},{'dengjielv':9,'star':9,'lv':150})