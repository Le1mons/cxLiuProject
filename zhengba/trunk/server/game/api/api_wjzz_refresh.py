#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 攻打界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [阵营]
    :param key:
    :return:
    ::
        {'s': 1}


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
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 等级不足
    if not g.chkOpenCond(uid, 'wjzz'):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    # 没有报名了
    if not g.m.wjzzfun.chkUserIsSignUp(uid):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wjzz_signup_-2')
        return _chkData

    # 次数不足
    if g.getPlayAttrDataNum(uid, 'wjzz_daynum') >= _con['refresh']:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _rival = g.m.wjzzfun.getRival(uid, str(data[0]), 1)
    # 对手已经死光了
    if 'res' in _rival and not _rival['res']:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('wjzz_rival_-4')
        return _chkData

    _chkData['rival'] = _rival
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    g.setPlayAttrDataNum(uid, 'wjzz_daynum')
    _res['d'] = {'rival':_chkData['rival']}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = [1]
    print doproc(g.debugConn, _data)