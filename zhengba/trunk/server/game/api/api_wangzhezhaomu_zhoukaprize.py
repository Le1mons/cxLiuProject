#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-周卡领奖
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

    # 信息
    _info = g.m.wangzhezhaomufun.getZhouKaInfo(uid, _hdinfo)
    if not _info["buy"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_zhoukaprize_res_-2')
        return _chkData

    _chkData["info"] = _info
    _chkData["hdinfo"] = _hdinfo
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

    _prize = []
    for idx in _info["getlist"]:
        p = _hdinfo["data"]["openinfo"]["zhouka"]["arr"][idx]
        if idx in _info["reclist"]:
            continue
        _info["reclist"].append(idx)
        _prize += p
    # # 合并奖励
    # _prize = g.mergePrize(_prize)
    _info["getlist"] = []
    # 设置活动数据
    _setData = {}
    _setData["v"] = _info["reclist"]
    g.m.wangzhezhaomufun.setZhouKaInfo(uid, _hdinfo, _setData)

    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_zhoukaprize', 'idxlist': _info["getlist"], "prize": _prize})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['zhouka'] = _info
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