#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

'''
冠军的试练 - 打开界面
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 不满55级
    if not g.chkOpenCond(uid,'championtrial'):
        _res['s'] = -1
        _res['errmsg'] = g.L('championtrial_open_res_-1')
        return _res

    _jifen = g.m.championfun.getChampionJifen(uid)
    _nt = g.C.NOW()
    _ntWeek = g.C.getWeekFirstDay(_nt)
    _con = g.GC['championtrial']['base']
    _closeTime = _con['colsetime']
    _openTime = _con['opentime']
    # 可以挑战的免费次数
    _freeNum = g.m.championfun.getFreeCanPkNum(uid)

    _rankInfo = g.m.rankfun.getChampionTrialRank(1, uid)
    _myRank = _rankInfo['myrank']

    # 获取战力
    _jjcInfo = g.m.championfun.getUserJJC(uid)
    if not _jjcInfo: _zhanli = 0
    else: _zhanli = _jjcInfo.get('zhanli', 0)
    # 获取防守信息
    _defHero = g.m.championfun.getDefendHero(uid)

    # 关闭时间
    if _nt - _ntWeek < _openTime:
        _time = _openTime + _ntWeek
    else:
        _time = _closeTime + _ntWeek

    _res['d'] = {'myrank': _myRank,'jifen':_jifen,'time':_time,
                 'freenum':_freeNum,'zhanli':_zhanli,'defhero':_defHero}
    return _res


if __name__ == '__main__':
    uid = g.buid("8")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=[0])