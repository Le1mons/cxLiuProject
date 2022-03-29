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

    _res['d'] = []
    _all = g.mdb.find('ladder_log', {'uid': uid}, sort=[['ctime', -1]],fields={'data':0,'uid':0})
    for i in _all:
        i['_id'] = str(i['_id'])
        i['svrname'] = i['headdata'].pop('svrname', '')
        _res['d'].append(i)

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
