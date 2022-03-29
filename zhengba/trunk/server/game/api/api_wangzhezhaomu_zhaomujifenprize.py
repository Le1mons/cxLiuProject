#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-招募积分奖励领奖
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

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    # 任务信息

    _info = g.m.wangzhezhaomufun.getZhaoMuInfo(uid, _hdinfo)
    _idx = len(_info["jifenreclist"])

    _con = _hdinfo["data"]["openinfo"]["zhaomu"]["jifenprize"][_idx]
    # 计算积分
    if _info["num"] * _hdinfo["data"]["openinfo"]["zhaomu"]["addjifen"] < _con["val"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-2')
        return _chkData

    # 判断是否领奖
    if _idx in _info["jifenreclist"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-3')
        return _chkData


    _chkData["idx"] = _idx
    _chkData["info"] = _info
    _chkData["hdinfo"] = _hdinfo
    _chkData["con"] = _con
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
    _info = _chkData["info"]
    _idx = _chkData["idx"]
    _con = _chkData["con"]

    _info["jifenreclist"].append(_idx)

    # 设置活动数据
    _setData = {}
    _setData["jifenreclist"] = _info["jifenreclist"]
    g.m.wangzhezhaomufun.setZhaoMuInfo(uid, _hdinfo, _setData)

    _prize = _con["prize"]
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_zhaomujifenprize', 'idx': _idx})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['zhaomu'] = _info
    _resData["prize"] = _prize

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = [0]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'