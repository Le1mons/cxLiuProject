#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
玩家 - 获取头像列表
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _avaterList = g.m.userfun.getHeadList(uid)
    _res['d'] = {'avaterlist': _avaterList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = [{"1":"5b2a5d12c0911a2e0ca08f36"},2]
    a = doproc(g.debugConn, data)
    print a
