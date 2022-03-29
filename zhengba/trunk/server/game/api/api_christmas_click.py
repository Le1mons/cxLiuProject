#!/usr/bin/python
# coding:utf-8
'''
圣诞活动 - 点击主城圣诞树
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(81, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_ding')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['1004']})

    return _res


if __name__ == '__main__':
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint(doproc(g.debugConn, data=[]))
