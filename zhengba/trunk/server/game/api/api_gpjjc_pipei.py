#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-匹配
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1


    # 获取公平竞技场是否开启
    _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    if not _chkOpen["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 判断战斗是否开启
    _nt = g.C.NOW()
    _closeTime = g.C.getLastMonthTime()
    _starTime = _closeTime - 7 * 24 * 3600
    if _starTime > _nt or _closeTime - 7200 < _nt:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 判断小时
    _hour = g.C.getHour()
    if g.C.getDateDiff(_starTime, _nt) >= 6:
        if _hour < 8 or _hour >= 22:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_noopen')
            return _chkData
    else:
        if _hour < 8:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_noopen')
            return _chkData


    # 获取玩家匹配数据
    _pipeiData = g.m.gongpingjjcfun.getPipeiData(uid, keys="_id,equip,fightdata,shipin,state,ctime")

    # 判断是否已经开始匹配
    if _pipeiData:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gpjjc_state_res_-1')
        return _chkData

    return _chkData



@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 获取玩家数据
    _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id,jifen,uid')

    # 初始化匹配数据
    _pipeiInfo = g.m.gongpingjjcfun.initPipeiData(uid)
    # 开启是匹配
    g.m.gongpingjjcfun.starPipei(uid, _myinfo['jifen'])

    _resData["pipeiinfo"] = _pipeiInfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('ysr1')
    print g.debugConn.uid
    _data = ["1"]
    print doproc(g.debugConn, _data)