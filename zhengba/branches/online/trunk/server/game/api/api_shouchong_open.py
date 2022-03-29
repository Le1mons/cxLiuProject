#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
首冲-查看首冲信息
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = g.m.shouchongfun.getShouChongData(uid)
    _res['d'] = {'shouchong':_resData,'paynum':g.m.payfun.getAllPayYuan(uid)}
    return _res

if __name__ == '__main__':
    uid = g.buid("tk1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6, 2])