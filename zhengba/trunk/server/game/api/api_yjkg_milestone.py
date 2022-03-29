#!/usr/bin/python
# coding:utf-8
'''
遗迹考古 - 领取里程碑奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [区域id:str, 索引:int]
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
    _map = str(data[0])
    _idx = abs(int(data[1]))

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,milestone.{0},farthest.{1}".format(_map, _map).split(','))
    _con = g.GC['yjkg']['milestone'][_map]
    # 条件不足
    if _myData['farthest'].get(_map, 0) < _con[_idx][0]:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_valerr')
        return _res

    # 已经领取完了
    if _idx in _myData['milestone'].get(_map, []):
        _res["s"] = -3
        _res["errmsg"] = g.L('global_algetprize')
        return _res

    _res['prize'] = _con[_idx][1]
    _res['idx'] = _idx
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.mdb.update('yjkg', {'uid': uid}, {'$push': {'milestone.{}'.format(data[0]):_chkData['idx']}})

    _send = g.getPrizeRes(uid, _chkData['prize'], {'act':'yjkg_recieve','idx':_chkData['idx']})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _chkData['prize']}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['1', 2])
