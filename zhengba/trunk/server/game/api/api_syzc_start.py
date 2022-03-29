#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
噬渊战场 - 开启
'''
def proc(conn, data,key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 英雄的站位信息
    _tidLists = data[0]
    # 回退的层数
    _rollbackIdx = int(data[1])
    # 判断是否开启
    if not g.chkOpenCond(uid, 'syzc'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _data = g.m.syzcfun.getData(uid)
    _nt = g.C.NOW()
    # 请先去重置
    _week = g.m.syzcfun.getWeek()

    # 判断是否
    if "week" in _data and _data["week"] == _week:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('hltb_star_res_-3')
        return _chkData


    # 上阵数量有问题
    if len(_tidLists) < 3:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('hltb_star_res_-2')
        return _chkData


    # 获取战斗数据
    _heroInfo = g.m.syzcfun.getHeroInfo(uid, _tidLists)
    if not _heroInfo['chk']:
        _chkData['s'] = _heroInfo['chk']
        _chkData['errmsg'] = _heroInfo['errmsg']
        return _chkData

    _chkData["heroinfo"] = _heroInfo
    _chkData["data"] = _data

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 回退的层数
    _rollbackIdx = int(data[1])
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 初始化数据
    _rollbacklayer = g.GC["syzccom"]["huituicengshu"][_rollbackIdx]
    _myData = g.m.syzcfun.initData(uid, _chkData["heroinfo"], _rollbacklayer)

    _res["d"] = {"mydata": _myData}

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = [[{"1":"5fe9adcd0ae9fe36fcf578af"}, {"1":"5fe9adcd0ae9fe36fcf578b0"}, {"1":"5fe9adcd0ae9fe36fcf578b1"}], 0]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'