#!/usr/bin/python
# coding:utf-8
import sys

sys.path.append('..')

import g

'''
邮件 - 打开邮件列表
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _where = {"senduid": uid, 'passtime': {'$gte': g.C.NOW()}, 'etype': 3}
    g.mdb.update('email', _where, {'isread': 1})
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, [{}])
