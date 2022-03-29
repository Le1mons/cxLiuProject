#!/usr/bin/python
# coding:utf-8
'''
英雄——增加格子
'''

import sys

sys.path.append('..')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务类型:str]
    :return:
    ::

        {'d': {'maxnum': 格子数量, 'buynum':已购买次数}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _geziInfo = g.m.userfun.getGeziNum(uid)
    _res['d'] = _geziInfo
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])