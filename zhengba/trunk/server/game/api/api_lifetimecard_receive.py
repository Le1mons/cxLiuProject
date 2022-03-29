#!/usr/bin/python
# coding:utf-8
'''
终生卡 - 领奖
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

        {"d": {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _con = g.GC['lifetimecard']
    # 等级不符
    if g.getOpenDay() < _con['day']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    gud = g.getGud(uid)
    # 还没购买
    if not gud.get('lifetimecard'):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 已领取
    if g.getPlayAttrDataNum(uid, 'lifetimecard_prize'):
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['prize'] = _con['prize']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.setPlayAttrDataNum(uid, 'lifetimecard_prize')
    _send = g.getPrizeRes(uid, _chkData['prize'], {'act':'lifetimecard_receive'})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _chkData['prize']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])