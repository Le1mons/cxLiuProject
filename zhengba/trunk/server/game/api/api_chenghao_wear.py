#!/usr/bin/python
# coding:utf-8

"""
称号--称号佩戴
"""

import sys

if __name__ == "__main__":
    sys.path.append('..')

import g

def proc(conn, data, key=None):
    """

    :param conn:
    :param data: ["1"]
    :param key:
    :return:
    ::

        {'s':1}
    """
    _res = doproc(conn, data)
    if key:
        _res = {key: _res}

    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {'s': 1}
    # _chk = g.chkOpenCondRes(uid, '')
    # if not _chk[0]:
    #     # 开启检测
    #     _res['s'] = -1
    #     _res['errmsg'] = _chk[1]
    #     return _res

    _cid = data[0]
    # gud = g.getGud(uid)
    # if _cid == gud['chenghao']:
    #     _res['s'] = -1
    #     _res['errmsg'] = g.L('chenghao_errmsg_code_-3')
    #     return _res

    chenghaoInfo = g.m.chenghaofun.getChengHaoList(uid, _cid)
    if not chenghaoInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('chenghao_errmsg_code_-1')
        return _res

    if chenghaoInfo[_cid] != 0 and chenghaoInfo[_cid] < g.C.NOW():
        _res['s'] = -2
        _res['errmsg'] = g.L('chenghao_errmsg_code_-1')
        return _res

    return _res

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData and _chkData['s'] < 0:
        return _chkData

    if data[0] == g.getGud(uid)['chenghao']:
        _r = g.m.chenghaofun.takeOffChengHao(uid)
        g.sendChangeInfo(conn, _r)
    else:
        _r = g.m.chenghaofun.wearChengHao(uid, data[0])
        g.sendChangeInfo(conn, _r)

    # 检查过期
    _r = g.m.chenghaofun.chkChengHaoTime(uid)
    if _r: g.sendChangeInfo(conn, _r)

    return _res


if __name__ == '__main__':
    uid = g.buid('lsq0')
    g.debugConn.uid = uid
    data = ['35']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
