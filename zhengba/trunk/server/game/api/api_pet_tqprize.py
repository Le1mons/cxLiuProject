#!/usr/bin/python
# coding:utf-8
'''
宠物 - 特权奖励
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

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 蛋的id
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    _crystal = g.mdb.find1('crystal', {'uid': uid}, fields=['_id', 'pay','date'])
    # 特权不足
    if not _crystal or _crystal.get('pay', 0) < g.C.NOW():
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 已经领取了
    if g.C.DATE(g.C.NOW()) == _crystal.get('date'):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['con'] = _con
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.mdb.update('crystal', {'uid': uid}, {'date': g.C.DATE(g.C.NOW())})

    _prize = _chkData['con']['tqprize']
    _send = g.getPrizeRes(uid, _prize, {'act':"pet_tqprize"})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])