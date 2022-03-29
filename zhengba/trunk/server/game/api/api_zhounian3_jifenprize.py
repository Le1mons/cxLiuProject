#!/usr/bin/python
# coding:utf-8
'''
三周年 - 领取积分奖励
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

    _hd = g.m.huodongfun.getHDinfoByHtype(77, "etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _idx = int(data[0])
    _con = g.m.zhounian3fun.getCon()['jifenprize'][_idx]
    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='jifenprize,val')
    # 任务没有完成
    if _data['val'] < _con['val']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData

    # 奖励已经领取
    if _idx in _data['jifenprize']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["con"] = _con
    _chkData['data'] = _data
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _idx = int(data[0])

    _con = _chkData["con"]
    _data = _chkData['data']
    _prize = list(_con['prize'])

    _data["jifenprize"].append(_idx)
    _setData = {}
    _setData["jifenprize"] = _data["jifenprize"]

    # 设置数据
    g.m.zhounian3fun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'zhounian3_jifenprize', 'idx': _idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res["d"]["prize"] = _prize

    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[0]))
