#!/usr/bin/python
# coding:utf-8
'''
展览馆 - 领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [层数:str]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    # 开区天数不足
    if g.getOpenDay() < g.GC['yjkg']['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _step = str(data[0])

    _exhibition = g.m.yjkgfun.getExhibitionData(uid)
    # 星级没达到要求
    if filter(lambda x:x < 1, _exhibition['data'][_step]):
        _res["s"] = -2
        _res["errmsg"] = g.L('global_valerr')
        return _res

    # 已经领取了
    if _step in _exhibition['rec']:
        _res["s"] = -3
        _res["errmsg"] = g.L('global_algetprize')
        return _res

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.mdb.update('exhibition',{'uid':uid},{'$push':{'rec':data[0]}})
    _prize = g.GC['yjkg']['exhibition'][data[0]]['prize']

    _send = g.getPrizeRes(uid, _prize, {'act':'exhibition_receive','step':data[0]})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 0])
