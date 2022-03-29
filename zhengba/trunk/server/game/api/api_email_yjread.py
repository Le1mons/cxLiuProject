#!/usr/bin/python
# coding:utf-8
'''
邮件 - 一键已读
'''

import sys
sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'s': 1}

    """
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
