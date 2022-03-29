#!/usr/bin/python
# coding:utf-8
'''
遗迹考古 - 商店购买
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [区域:str, 类型:str]
    :return:
    ::

        {'d': {prize: []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,key,exp".split(','))
    _map = str(data[0])
    _type = str(data[1])

    _set = {}
    _con = g.GC['yjkg']['store'][_map][_type]
    _need = _con['need']
    # 如果是类型1的  今天已经买过
    if _type == "1" and _myData['key'] != g.C.DATE():
        _need = []
        _set['key'] = g.C.DATE()

    if _need:
        _chk = g.chkDelNeed(uid, _need)
        # 消耗不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _delData = g.delNeed(uid, _need, 0, logdata={'act': 'yjkg_buy'})
        g.sendChangeInfo(conn, _delData)

    # 增加经验
    if _con['exp'] > 0:
        _set['exp.{}'.format(_map)] = _set['exp'].get(_map, 0) + _con['exp']

    if _set:
        g.mdb.update('yjkg',{'uid':uid},_set)

    # 增加奖励
    if _con['dlz']:
        _prize = g.m.diaoluofun.getGroupPrize(_con['dlz'])
        _send = g.getPrizeRes(uid, _prize, {'act': 'yjkg_buy', 't': _type})
        g.sendChangeInfo(conn, _send)

        _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
