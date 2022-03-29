#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-任务累计积分奖励领奖
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
def proc(conn, data,key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _idx = int(data[0])

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    # 任务信息
    _taskCon = _hdinfo["data"]["openinfo"]["task"]["jifenprize"][_idx]
    _taskInfo = g.m.wangzhezhaomufun.getTaskInfo(uid, _hdinfo)
    if _taskInfo["alljifen"] < _taskCon["val"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-2')
        return _chkData

    # 判断是否领奖
    if _idx in _taskInfo["alljfreclist"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-3')
        return _chkData


    _chkData["idx"] = _idx
    _chkData["taskInfo"] = _taskInfo
    _chkData["hdinfo"] = _hdinfo
    _chkData["taskCon"] = _taskCon
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _hdinfo = _chkData["hdinfo"]
    _taskInfo = _chkData["taskInfo"]
    _idx = _chkData["idx"]
    _taskCon = _chkData["taskCon"]

    _taskInfo["alljfreclist"].append(_idx)

    # 设置活动数据
    _setData = {}
    _setData["alljfreclist"] = _taskInfo["alljfreclist"]

    # 设置累计积分
    g.m.wangzhezhaomufun.setTaskInfo(uid, _hdinfo, _setData)

    _prize = _taskCon["prize"]
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_taskalljifenprize', 'idx': _idx, "prize": _prize})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['task'] = _taskInfo
    _resData["prize"] = _prize

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    data = [0]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'