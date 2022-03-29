#!/usr/bin/python
# coding:utf-8
'''
遗迹考古 - 学习技能
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [区域id:str, 技能id:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _map = str(data[0])
    _sid = str(data[1])

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,skill.{0},exp".format(_map).split(','))
    # 技能已经学习le
    if _sid in _myData['skill'].get(_map, []):
        _res["s"] = -4
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _skillCon = g.GC['yjkgskill'][_map][_sid]
    # 前置技能还没学习
    if _skillCon['preskill'] and _skillCon['preskill'] not in _myData['skill'].get(_map, []):
        _res["s"] = -2
        _res["errmsg"] = g.L('yjkg_skill_-2')
        return _res

    # 经验不足
    if _myData['exp'] < _skillCon['exp']:
        _res["s"] = -3
        _res["errmsg"] = g.L('yjkg_skill_-3')
        return _res

    _res['data'] = _myData
    _res['exp'] = _skillCon['exp']
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _set = {'$inc': {'exp': -_chkData['exp']}, '$addToSet': {'skill.{}'.format(data[0]): str(data[1])}}
    g.mdb.update('yjkg', {'uid': uid}, _set)
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['1', 1001])
