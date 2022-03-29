#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 主界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: []
    :param key:
    :return:
    ::
        {'d': {
                'signnum': 报名人数,
                'signup': 是否报名了
                if 挑战赛期间 并且报名了
                    'data' = {'num':我的连击数, 'faction': 我的阵营}
                    'strongest'] = {'headdata':{},'num':连击数}  如果是null 就没有
                    'faction'] = [{'num':水晶受到的伤害,'team':剩余队伍,'faction':阵营}]
                    'pilao'] = {tid: 已出战次数}
                    'status'] = {tid: {'hp':血量百分比, 'nuqi': 剩余怒气, 'maxhp': 最大血量}}
        }
        's': 1}


    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    return
    _chkData = {}
    _chkData["s"] = 1
    _con = g.GC['five_army']['base']
    # 开区天数不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_openday', _con['openday']-g.getOpenDay())
        return _chkData

    # 等级不足
    if not g.chkOpenCond(uid, 'wjzz'):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('wjzz_open_-4')
        return _chkData

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 如果开启了
    _key = g.m.wjzzfun.getSeasonNum()
    _data = g.crossDB.find1('wjzz_data', {'key': _key, 'uid': uid}, fields=['_id', 'num', 'group', 'faction'])
    if _data:
        # 消除红点
        g.setAttr(uid, {'ctype': 'wjzz_dailyhd'}, {'v': 1})
        _res['d'] = g.m.wjzzfun.getMainData(uid)
    else:
        _res['d'] = {'signnum':g.m.wjzzfun.getSignUpNum(),'signup':g.m.wjzzfun.chkUserIsSignUp(uid)}

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = []
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'