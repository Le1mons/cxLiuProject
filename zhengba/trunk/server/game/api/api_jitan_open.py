#!/usr/bin/python
# coding:utf-8
'''
祭坛——开启界面
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

        {"d": {"putong": {freenum:免费次数, 'freecd':免费时间},
                'gaoji': {freenum:免费次数, 'freecd':免费时间},
                'jifen': 积分}
        's': 1}

    """
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