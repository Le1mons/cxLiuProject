#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 购买次数
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

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['ladder']
    gud = g.getGud(uid)
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or gud['lv'] < _con['lv']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _buy = g.getPlayAttrDataNum(uid, 'ladder_buynum')

    # 没有剩余购买次数了
    if _buy >= len(_con['buynum']):
        _res["s"] = -2
        _res["errmsg"] = g.L('global_noopen')
        return _res

    # vip不够
    if _con['buynum'][_buy][0] > gud['vip']:
        _res["s"] = -3
        _res["errmsg"] = g.L('global_limitvip')
        return _res

    _need = _con['buynum'][_buy][1]
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _res['need'] = _need
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = g.delNeed(uid, _chkData['need'], 0, {'act':'ladder_buy'})
    g.sendChangeInfo(conn, _send)
    # 今日购买次数
    g.setPlayAttrDataNum(uid, 'ladder_buynum')

    g.m.ladderfun.setEnergeNum(uid, 1)

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('wlx')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
