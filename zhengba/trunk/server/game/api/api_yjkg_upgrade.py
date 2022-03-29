#!/usr/bin/python
# coding:utf-8
'''
遗迹考古-辅助仪器升级
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [升级类型:str(speed, exp)]
    :return:
    ::

        {'d': 最终等级
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
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _type = data[0]

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,yiqi,energe".split(','))

    _lv = _myData['yiqi'][_type] + 1

    # 已升至满级
    if str(_lv) not in _con['yiqi'][_type]:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _need = _con['yiqi'][_type][str(_lv)]['need']
    # 能源不足
    if _myData['energe'] < _need:
        _res["s"] = -3
        _res["errmsg"] = g.L('yjkg_upgrade_-3')
        return _res

    _res['energe'] = _myData['energe'] - _need
    _res['lv'] = _lv
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if "s" in _chkData:
        return _chkData

    g.mdb.update('yjkg', {'uid': uid}, {'yiqi.{}'.format(data[0]): _chkData['lv'],'energe':_chkData['energe']})

    _res['d'] = {'lv': _chkData['lv'], 'energe': _chkData['energe']}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['exp', 2])
