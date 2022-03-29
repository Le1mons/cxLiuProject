#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
领取爵位月礼包每日奖励
'''


def proc(conn,data):
    '''

    :param conn:
    :param data: [tid:str]:tid:英雄tid
    :param key:
    :return: dict
    ::

       {'s': 1}

    '''

    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    gud = g.getGud(uid)
    _titleLv = gud["title"]
    # _ctime = gud["ctime"]
    # 获取当前零点时间戳
    # _nt = g.C.NOW()
    # _zt = g.C.ZERO(_nt)

    # 获取创建账号的是零点时间戳
    # _czt = g.C.ZERO(_ctime)
    # 判断玩家是否满足了创建账号22天后开启的条件
    if g.getOpenDay() < 22:
        # 不满足开启条件
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('title_lvup_res_-1', 22 - g.getOpenDay())
        return _chkData

    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    gud = g.getGud(uid)

    _con = g.GC['chongzhihd']["jueweilibao"]
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _resData = {}
    for key in _con:
        _resData[key] = g.m.titlefun.getLiBaoNum(uid, key)

    _chkDay = g.m.titlefun.chkDayPrize(uid, "jueweilibao_3")
    _chkFreeDay = g.m.titlefun.chkFreeDayPrize(uid)
    # 日常任务
    _isRecTask = g.m.titlefun.chkDailyTaskOver(uid)

    # 判断今天是否领取过
    _resData["isprize"] = 0 if _chkDay and _chkFreeDay else 1
    _resData["task"] = _isRecTask
    _resData["reclist"] = g.getAttrByCtype(uid, 'title_aimsprize', bydate=False, default=[])
    # 剩余购买次数
    _resData["buynum"] = g.m.titlefun.getDayBuyNum(uid)
    _resData["gift"] = {'1': g.getAttrByCtype(uid, 'title_cost_1'), '2': g.getAttrByCtype(uid,'title_cost_2',bydate=False,k=g.C.getWeekNumByTime(g.C.NOW()))}
    _res["d"] = _resData
    return _res


if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # g.getPrizeRes(uid, [{"a":"attr", "t": "jinbi", "n": 100000000000}])
    gud = g.getGud(uid)
    data = ["5d77521c0ae9fe4150e7b0bb", 5]

    _r = doproc(g.debugConn, data)
    pprint(_r)
    if 'errmsg' in _r: print _r['errmsg']