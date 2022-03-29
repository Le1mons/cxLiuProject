#!/usr/bin/python
# coding:utf-8
'''
展览馆 - 打开界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {
            "rec":[已领取的层数],
            "data": {"1":[索引0的星级]}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    # 开区天数不足
    if g.getOpenDay() < g.GC['yjkg']['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _data = g.m.yjkgfun.getExhibitionData(uid)
    _res['d'] = _data
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
