#!/usr/bin/python
# coding:utf-8
'''
趣味成就 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {"nval": {"1 任务id": 1 当前值}, 'receive': [以领取任务id"]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    return

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _qwcj = g.m.qwcjfun.getQwcjData(uid)
    _res['d'] = {'nval': _qwcj['nval'], 'receive': _qwcj.get('receive', [])}
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])