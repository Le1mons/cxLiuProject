#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄人气冲榜-海选
'''


def proc(conn, data, key=None):
    """

    :param conn:
    :param 参数1: pllist	类型: <type 'list'>	说明: 投票的英雄评论id列表
    :return:
    ::

        {'d': {'day': 1, 活动的第几天
       'kuaizhao': {},快照。如果没有就不显示
       'myinfo': {'ctime': 1609929183,
                  'duihuan': {}, 已经兑换的数量
                  'haixuan': [], 海选选择的英雄
                  'hdid': 999999,
                  'heronum': {}, 每个状态投的英雄的票数
                  'lasttime': 1609929183,
                  'libao': {}, 礼包购买的数量
                  'num': 0, 总共投的票数
                  'pinfo': {}, 每一个英雄的权重
                  'selecthid': '', 当前状态下选择的英雄
                  'sid': 0,
                  'task': {}, 任务进度
                  'taskrec': [], 任务领取情况
                  'uid': u'0_5ea2b6359dc6d633c953dd72'},
       'state': 1},
 's': 1}


    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _pllist = data[0]
    _con = g.GC["herohot"]

    # 获取公平竞技场是否开启
    _openinfo = g.m.herohot_69.isOpen(uid)
    if not _openinfo["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _day = g.m.herohotfun.getHuoDongDay(_openinfo["stime"])
    # 必须要传3个
    if len(set(_pllist)) < 3:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    _openTime = _con["opentime"]
    # 获取本轮状态
    _state = _openTime[str(_day)]["state"]
    # 状态不是海选就无法掉接口
    if _state != 1:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 获取玩家数据
    _myinfo = g.m.herohotfun.getUserData(uid, _openinfo["hdid"])
    # 判断是否已经参与过海选
    if _myinfo["haixuan"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    _chkData["openinfo"] = _openinfo
    _chkData["myinfo"] = _myinfo
    _chkData["state"] = _state
    _chkData["day"] = _day
    _chkData["pllist"] = _pllist
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

    _openinfo = _chkData["openinfo"]
    _myinfo = _chkData["myinfo"]
    _state = _chkData["state"]
    _day = _chkData["day"]
    _pllist = _chkData["pllist"]

    _setData = {}
    _setData["haixuan"] = _pllist
    _myinfo["haixuan"] = _pllist

    _con = g.GC["herohot"]
    _power = _con["stateinfo"][str(_state)]["power"]
    # 加入随机权重
    for plid in _pllist:
        if plid not in _myinfo["pinfo"]:
            _myinfo["pinfo"][str(plid)] = 0
        _myinfo["pinfo"][str(plid)] += _power
    _setData["pinfo"] = _myinfo["pinfo"]

    # 设置购买数据
    g.m.herohotfun.setUserData(uid, _openinfo["hdid"], _setData)

    for plid in _pllist:

        # 设置投票数据
        g.m.herohotfun.setHeroHotInfo(_openinfo["hdid"],_state,  str(plid), {"$inc": {"num": 1}})


    _resData["myinfo"] = _myinfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq0')
    from pprint import pprint

    _data = [["2501", "3201", "4401"]]
    pprint(doproc(g.debugConn, _data))