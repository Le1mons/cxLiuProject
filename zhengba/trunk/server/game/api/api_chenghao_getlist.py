#!/usr/bin/python
# coding:utf-8

"""
称号--获取称号列表
"""

import sys

if __name__ == "__main__":
    sys.path.append('..')

import g

def proc(conn, data, key=None):
    """

    :param conn:
    :param data:
    :param key:
    :return:
    ::

        {
            "s":1
            "list":{
                "1": 12323131313,
                "2": 12323131313,
                "3": 12323131313,
            }
        }
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

    return _res

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData and _chkData['s'] < 0:
        return _chkData

    _chengHaoList = g.m.chenghaofun.getChengHaoList(uid)

    # 检查过期
    _r = g.m.chenghaofun.chkChengHaoTime(uid)
    if _r: g.sendChangeInfo(conn, _r)

    _res['d'] = {'list':_chengHaoList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])
