#!/usr/bin/python
# coding:utf-8
'''
三周年 - 任务领取
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(77,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _taskID = str(data[0])

    _con = g.m.zhounian3fun.getCon()['task'][_taskID]
    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='task,val')
    # 任务没有完成
    if _data['task']['data'].get(_taskID, 0) < _con['pval']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData

    # 奖励已领取
    if _taskID in _data['task']['rec']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _taskID = str(data[0])
    _con = g.m.zhounian3fun.getCon()
    _taskCon = _con['task'][_taskID]

    _addjifen = _taskCon["addjifen"]
    _prize = list(_taskCon['prize'])
    _data = _chkData["data"]

    # 记录任务领奖
    _data["task"]["rec"].append(_taskID)
    _data["val"] += _addjifen

    _setData = {}
    _setData["task"] = _data["task"]
    _setData["val"] = _data["val"]

    # 设置数据
    g.m.zhounian3fun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'zhounian3_recieve', 'taskid':_taskID})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res['d']['prize'] = _prize

    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])