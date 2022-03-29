#!/usr/bin/python
# coding:utf-8
'''
三周年 - 周卡领奖
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


    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='zhouka')
    # 任务没有完成
    if not _data['zhouka']['buy']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData
    _idx = _data["zhouka"]["getidx"]
    # 奖励已领取
    if _idx in _data['zhouka']['rec']:
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

    _con = g.m.zhounian3fun.getCon()
    _data = _chkData["data"]

    _idx = _data["zhouka"]["getidx"]
    # 记录任务领奖
    _data["zhouka"]["rec"].append(_idx)

    _setData = {}
    _setData["zhouka"] = _data["zhouka"]

    _prize = _con["zhouka"]["arr"][_idx]
    # 设置数据
    g.m.zhounian3fun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'zhounian3_zhoukaprize', 'idx':_idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res['d']['prize'] = _prize

    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])