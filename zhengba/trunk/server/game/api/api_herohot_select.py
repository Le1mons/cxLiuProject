#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄人气冲榜-选择英雄
'''


def proc(conn, data, key=None):
    """

    :param conn:
    :param 参数1: plid	类型: <type 'str'>	说明: 投票的英雄的评论id
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

    _plid = str(data[0])
    _con = g.GC["herohot"]

    # 获取公平竞技场是否开启
    _openinfo = g.m.herohot_69.isOpen(uid)
    if not _openinfo["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _day = g.m.herohotfun.getHuoDongDay(_openinfo["stime"])
    _openTime = _con["opentime"]
    # 获取本轮状态
    _state = _openTime[str(_day)]["state"]
    # 状态不是海选就无法掉接口
    if _state not in [2, 3, 4, 5]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 获取玩家数据
    _myinfo = g.m.herohotfun.getUserData(uid, _openinfo["hdid"])
    # 判断是否已经参与过海选
    if _myinfo["selecthid"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    _chkData["openinfo"] = _openinfo
    _chkData["myinfo"] = _myinfo
    _chkData["state"] = _state
    _chkData["day"] = _day
    _chkData["plid"] = _plid
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
    _plid = _chkData["plid"]

    _setData = {}
    _setData["selecthid"] = _plid
    _myinfo["selecthid"] = _plid

    _con = g.GC["herohot"]

    if _state not in _myinfo["heronum"]:
        _myinfo["heronum"][str(_state)] = {}
    _myinfo["heronum"][str(_state)][str(_plid)] = 0
    _setData["heronum"] = _myinfo["heronum"]

    # 设置购买数据
    g.m.herohotfun.setUserData(uid, _openinfo["hdid"], _setData)

    _resData["myinfo"] = _myinfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq0')
    from pprint import pprint

    _data = [1101]
    pprint(doproc(g.debugConn, _data))