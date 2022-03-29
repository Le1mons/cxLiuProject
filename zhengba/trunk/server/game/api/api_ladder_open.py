#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 打开界面
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
            'star': 星数，
            'win': 连胜次数，
            ‘fight’：今日挑战次数,
            'buy':今日购买次数,
            'receive':[已领取奖励索引],
            'num': 剩余匹配次数,
            'freetime':上次恢复次数的时间戳
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

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _today = g.getAttrByDate(uid, {'ctype': 'ladder_today'}) or [{'v': {}}]
    _rData = {}
    # 星数
    _rData['star'] = g.m.ladderfun.getUserStar(uid)
    # 连胜次数
    _rData['win'] = _today[0]['v'].get('win', 0)
    # 今日挑战次数
    _rData['fight'] = _today[0]['v'].get('fight', 0)
    # 今日购买次数
    _rData['buy'] = g.getPlayAttrDataNum(uid, 'ladder_buynum')
    # 已领取奖励
    _rData['receive'] = _today[0]['v'].get('receive', [])
    # 新赛季
    _rData['new'] = _today[0]['v'].get('new', 1)
    if _rData['new']:
        _today[0]['v']['new'] = 0
        g.setAttr(uid, {'ctype': 'ladder_today'}, {'v': _today[0]['v']})

    _rData.update(g.m.ladderfun.getEnergeNum(uid, 1))

    _res['d'] = _rData
    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('wlx')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
