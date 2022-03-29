#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-任务领奖
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
    _taskid = str(data[0])

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    # 任务信息
    _taskCon = _hdinfo["data"]["openinfo"]["task"]["tasklist"][_taskid]
    _taskInfo = g.m.wangzhezhaomufun.getTaskInfo(uid, _hdinfo)
    if _taskInfo["taskinfo"][_taskid] < _taskCon["pval"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-2')
        return _chkData

    # 判断是否领奖
    if _taskid in _taskInfo["reclist"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-3')
        return _chkData


    _chkData["taskid"] = _taskid
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
    _taskid = _chkData["taskid"]
    _taskCon = _chkData["taskCon"]

    _taskInfo["reclist"].append(_taskid)
    # 加上积分数据
    _taskInfo["jifen"] += _taskCon["addjifen"]
    _taskInfo["alljifen"] += _taskCon["addjifen"]
    # 设置活动数据
    _setData = {}
    _setData["jifen"] = _taskInfo["jifen"]
    _setData["reclist"] = _taskInfo["reclist"]
    _setData["alljifen"] = _taskInfo["alljifen"]
    g.m.wangzhezhaomufun.setTaskInfo(uid, _hdinfo, _setData)



    _prize = _taskCon["prize"]
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_taskprize', 'id': _taskid, "prize": _prize})
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
    data = [101]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'