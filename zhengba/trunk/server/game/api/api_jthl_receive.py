#!/usr/bin/python
# coding:utf-8
'''
积天豪礼 - 领奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [索引: int]
    :return:
    ::

        {"d": {
            prize:    [],
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}
    _idx = abs(int(data[0]))

    _data = g.m.jthlfun.getData(uid)
    # 奖励已领取
    if _idx in _data['rec']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _con = g.GC['jthl'][_data['key']]['prize'][_idx]
    # 条件不足
    if _data['val'] < _con['val']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_valerr')
        return _res

    _data['rec'].append(_idx)
    _res['data'] = _data
    _res['prize'] = _data['data'][_idx]['p']
    return _res

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.setAttr(uid, {'ctype': 'jthl_data'}, {'v': _chkData['data']})

    _prize = _chkData['prize']

    _send = g.getPrizeRes(uid, _prize, {'act': 'jthl_receive', 'idx':data[0]})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2])