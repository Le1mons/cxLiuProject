#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄人气冲榜-open
'''

def proc(conn, data, key=None):
    """

    :param conn:
    :param 参数1: 必须参数	类型: <type 'str'>	说明:
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
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
       'state': 1},状态 1是海选。2是32强，3是16强，4是8强。5是决赛
 's': 1}


    """



    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    # 获取公平竞技场是否开启
    _openinfo = g.m.herohot_69.isOpen(uid)
    if not _openinfo["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _chkData["openinfo"] = _openinfo
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

    _con = g.GC["herohot"]
    # 获取玩家数据
    _myinfo = g.m.herohotfun.getUserData(uid, _openinfo["hdid"])
    _resData["myinfo"] = _myinfo


    # 获取活动当前是第几天
    _day = g.m.herohotfun.getHuoDongDay(_openinfo["stime"])
    _resData["day"] = _day

    _openTime = _con["opentime"]
    # 获取本轮状态
    _state = _openTime[str(_day)]["state"]
    _resData["state"] = _state

    # 获取快照
    _resData["kuaizhao"] = g.m.herohotfun.getKuaiZhao(_openinfo["hdid"])
    # 获取当前决赛每个英雄投票玩家投票的次数
    lottery = {}

    # 判断是否有红点
    _chkHd = g.m.herohotfun.chkHd(uid,_myinfo, _openinfo["hdid"], isset=1)

    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    if _state == 6 or (_day == 7 and _nt > _zt + 22 * 3600 + 1800):
        # 获取开奖数据
        lottery = g.m.herohotfun.getLottery(_openinfo["hdid"])
        _resData["kuaizhao"] = g.m.herohotfun.getPromoted(_openinfo["hdid"]).get("win", {})
        _data = g.getAttrOne(uid, {"ctype": "herohot_zhekehd", "k": _openinfo["hdid"]})
        # 红点
        if not _data:
            g.setAttr(uid, {"ctype": "herohot_zhekehd"}, {"v": 1,"k": _openinfo["hdid"]})
    # 判断状态，每日余票红点
    if 2 <= _state <= 5:
        _data = g.getAttrOne(uid, {"ctype": "herohot_toupiaohd", "k": _openinfo["hdid"]})
        # 判断今天是否点进去过
        if not _data:
            g.setAttr(uid, {"ctype": "herohot_toupiaohd"}, {"v":1,"k": _openinfo["hdid"]})




    _resData["lottery"] = lottery
    _res["d"] = _resData

    return _res






if __name__ == '__main__':

    g.debugConn.uid = g.buid('lsq0')
    from pprint import pprint

    _data = ['0_5aec54eb625aee6374e25dff']
    pprint (doproc(g.debugConn,_data))