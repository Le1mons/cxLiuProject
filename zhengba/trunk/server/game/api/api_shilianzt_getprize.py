#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
试炼之塔 - 领奖
'''
def proc(conn, data,key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _idx = int(data[0])

    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _data = g.m.shilianztfun.getData(uid)
    _con = dict(g.GC["shilianztcom"])
    _taskCon = _con["task"][_idx]
    # 今天已经没有挑战次数了
    if _data["layernum"] < _taskCon["pval"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('hltb_fight_res_-9')
        return _chkData

    _recList = g.m.shilianztfun.getTaskRec(uid)
    # 判断是否通关
    if _idx in _recList:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('hltb_fight_res_-9')
        return _chkData


    _chkData["data"] = _data
    _chkData["reclist"] = _recList
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

    _idx = int(data[0])

    _data = _chkData["data"]
    _con = dict(g.GC["shilianztcom"])
    _taskCon = _con["task"][_idx]

    _prize = _taskCon["prize"]
    _prizeData = g.getPrizeRes(uid, _prize,  {'act': "shilianzt_getprzie", "prize": _prize, "idx": _idx})
    g.sendChangeInfo(conn, _prizeData)
    _resData["prize"] = _prize

    # 设置领奖标记
    g.m.shilianztfun.setTaskRec(uid, _idx)
    _chkData["reclist"].append(_idx)
    _resData["reclist"] = _chkData["reclist"]
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('1')
    g.debugConn.uid = uid
    _data = [0]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'