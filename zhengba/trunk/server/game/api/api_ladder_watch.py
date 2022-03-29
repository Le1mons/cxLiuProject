#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 查看录像
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [日志id]
    :return:
    ::

        {'d': {
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['ladder']
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or g.getGud(uid)['lv'] < _con['lv']:
        _res["s"] = -1
        _res["errmsg"] = g.L('ladder_open_-1')
        return _res

    _log = g.crossDB.find1('ladder_log', {'_id': g.mdb.toObjectId(data[0])}, fields=['_id'])
    if _log is None:
        _log = g.mdb.find1('ladder_log', {'_id': g.mdb.toObjectId(data[0])}, fields=['_id'])

    _res['d'] = _log
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _head = g.m.userfun.getShowHead(uid)
    for i in _chkData['d']['data']:
        i['headdata'] = [_head, _chkData['d']['headdata']]

    _res['d'] = _chkData['d']
    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['5f02e4df2e5f913a47062c6f', 1])
