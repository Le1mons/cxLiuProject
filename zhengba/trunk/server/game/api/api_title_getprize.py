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

    _con = g.GC["titlecom"]
    gud = g.getGud(uid)

    _chkKey = "jueweilibao_3"

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
        _chkData['errmsg'] = g.L('title_lvup_res_-1')
        return _chkData

    _chkDay = g.m.titlefun.chkDayPrize(uid, _chkKey)
    _chkFreeDay = g.m.titlefun.chkFreeDayPrize(uid)
    # 日常任务
    _isRecTask = g.m.titlefun.chkDailyTaskOver(uid)
    if not _isRecTask:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('title_getprize_res_-4')
        return _chkData

    # 判断今天是否领取过
    if _chkDay and _chkFreeDay:
        # 今天已经领取
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('title_getprize_res_-2')
        return _chkData

    _prize = []
    # 如果今天的特权奖励没领，就可以领奖
    if not _chkDay:
        _prize += list(_con["tequanprize"])
        # 设置今日领奖
        # g.m.titlefun.setDayPrize(uid, _chkKey)
    # 如果今天每日的免费奖励没领，就可以领奖
    if not _chkFreeDay:
        _prize += list(_con["freeprize"])
        # g.m.titlefun.setFreeDayPrize(uid)

    if not _prize:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    if not _chkDay:
        # 设置今日领奖
        g.m.titlefun.setDayPrize(uid, _chkKey)
    # 如果今天每日的免费奖励没领，就可以领奖
    if not _chkFreeDay:
        g.m.titlefun.setFreeDayPrize(uid)

    # 合并奖励
    _prize = g.mergePrize(_prize)

    _chkData["con"] = _con
    _chkData["prize"] = _prize
    _chkData["chkkey"] = _chkKey
    # 每日特权礼包奖励是否领取
    _chkData["chkDay"] = _chkDay
    # 每日免费奖励是否领取
    _chkData["chkFreeDay"] = _chkFreeDay
    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    gud = g.getGud(uid)

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _con = _chkData["con"]
    _chkKey = _chkData["chkkey"]
    _chkDay = _chkData["chkDay"]
    _chkFreeDay = _chkData["chkFreeDay"]
    _prize = _chkData['prize']
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'title_getprize'})
    # 推送前端
    g.sendChangeInfo(conn, _sendData)

    _res["d"] = {"prize": _prize}
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