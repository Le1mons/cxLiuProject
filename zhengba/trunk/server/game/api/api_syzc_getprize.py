#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
噬渊战场 - 领取任务奖励
'''


def proc(conn, data, key=None):
   

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1
    # 领奖下标
    _idx = int(data[0])
    # 判断是否开启
    if not g.chkOpenCond(uid, 'syzc'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = dict(g.GC["syzccom"])

    _data = g.m.syzcfun.getData(uid)
    # 请先去重置
    _week = g.m.syzcfun.getWeek()
    if "week" not in _data or _data["week"] != _week:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    # 判断是否达到领奖条件
    if _data["layernum"] < _con["layerprize"][_idx]["pval"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('task_lingqu_res_-1')
        return _chkData

    # 判断是否已经领过奖励
    if _idx in _data["layerrec"]:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData["data"] = _data
    _chkData["idx"] = _idx
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

    _data = _chkData["data"]
    _idx = _chkData["idx"]


    _con = dict(g.GC["syzccom"])
    _prize = _con["layerprize"][_idx]["prize"]
    _data["layerrec"].append(_idx)

    g.m.syzcfun.setData(uid, {"layerrec":_data["layerrec"]})
    # 获取奖励
    _prizeData = g.getPrizeRes(uid, _prize,{'act': "syzc_getprize", "prize": _prize, "idx": _idx})
    g.sendChangeInfo(conn, _prizeData)
    _resData["prize"] = _prize
    # # 记录本层获取的所有奖励
    _resData["myinfo"] = _data
    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = [0]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'