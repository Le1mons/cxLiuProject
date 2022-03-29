#!/usr/bin/python
# coding:utf-8
'''
积天豪礼 - 主界面
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

        {"d": {
            key:    配置的key,
            money:  充值了多少钱,
            rec:    [奖励的val]
            val:    可以领取的val
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = g.m.jthlfun.getData(uid)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0])