#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄人气冲榜-ranklist
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
       'state': 1},
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


    _cacheRank = g.crossMC.get("herohot_rank_{}".format(_openinfo["hdid"]))
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('herohot_user', {'hdid': _openinfo["hdid"], "num":{"$gt": 0}}, fields=['_id', 'num', "uid"], sort=[['num', -1], ["tptime", 1], ['lasttime', 1]], limit=50)
        _rank = 1

        # _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _list:
            _temp = {}
            _temp['headdata'] = {}
            try:
                _temp['headdata'] = \
                g.crossDB.find1("cross_friend", {"uid": i["uid"]}, fields={'_id': 0, 'head.defhero': 0})["head"]
            except:
                print i["uid"], "getGpjjcRank"

            _temp['rank'] = _rank
            _temp['val'] = i['num']
            _temp['name'] = _temp['headdata'].get("svrname", "暂无区服")
            _uid2rank[i["uid"]] = _rank
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set("herohot_rank_{}".format(_openinfo["hdid"]), {"list": _rankList, 'uid2rank': _uid2rank}, 60)

    _myRank = -1
    _myData = g.crossDB.find1('herohot_user', {'hdid': _openinfo["hdid"], "uid": uid},
                              fields=['_id', 'num'])
    _num = _myData['num']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _num > 0:
        _myRank = g.crossDB.count('herohot_user', {'hdid': _openinfo["hdid"], 'num': {'$gt': _num}}) + 1


    _res["d"] = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _num}

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('ysr1')
    from pprint import pprint

    _data = ['0_5aec54eb625aee6374e25dff']
    pprint (doproc(g.debugConn,_data))