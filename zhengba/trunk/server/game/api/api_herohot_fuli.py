#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄人气冲榜-兑换
'''


def proc(conn, data, key=None):
    """

    :param conn:
    :param 参数1: id	类型: <type 'str'>	说明: 兑换的id
    :param 参数2: num	类型: <type 'int'>	说明: 数量
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
    _id = int(data[0])
    _con = g.GC["herohot"]

    # 获取公平竞技场是否开启
    _openinfo = g.m.herohot_69.isOpen(uid)
    if not _openinfo["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 获取玩家数据
    _myinfo = g.m.herohotfun.getUserData(uid, _openinfo["hdid"])
    # 判断是否已经参与过海选
    if _id in _myinfo["fuli"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 判断条件是否达到
    if _myinfo["num"] < _con["fuli"][_id]["val"]:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    _prize = _con["fuli"][int(_id)]["prize"]
    _prize = g.mergePrize(_prize)

    _chkData["openinfo"] = _openinfo
    _chkData["myinfo"] = _myinfo

    _chkData["id"] = _id
    _chkData["prize"] = _prize
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
    _id = _chkData["id"]
    _prize = _chkData["prize"]


    _setData = {}
    _myinfo["fuli"].append(_id)
    _setData["fuli"] = _myinfo["fuli"]

    # 设置购买数据
    g.m.herohotfun.setUserData(uid, _openinfo["hdid"], _setData)
    # 发奖
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'herohot_fuli', "id": _id})
    g.sendChangeInfo(conn, _sendData)

    _resData["myinfo"] = _myinfo
    _resData["prize"] = _prize
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('lyf')
    from pprint import pprint

    _data = [0, 1]
    pprint(doproc(g.debugConn, _data))