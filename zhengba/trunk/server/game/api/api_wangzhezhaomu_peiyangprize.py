#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-英雄培养领奖
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
def proc(conn, data,key=None):
    """

    :param conn:
    :param data: ["idx": int]
    :param key:
    :return:
            {'d': {'priyang': {'reclist': [0], 'val': 11},
               'prize': [{u'a': u'item', u'n': 1, u't': u'1048'}]},
         's': 1}
    """
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

    # 信息
    _con = _hdinfo["data"]["openinfo"]["peiyang"]["arr"][_idx]
    _info = g.m.wangzhezhaomufun.getPeiYangInfo(uid, _hdinfo)
    # 条件不满足
    if not _info["val"].get(str(_idx), 0):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-2')
        return _chkData

    # 判断是否领奖
    if _idx in _info["reclist"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wangzhezhaomu_taskjifenprize_res_-3')
        return _chkData

    _chkData["info"] = _info
    _chkData["hdinfo"] = _hdinfo
    _chkData["idx"] = _idx
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
    _con = _chkData["con"]
    _idx = _chkData["idx"]

    _info["reclist"].append(_idx)
    # # 合并奖励
    # _prize = g.mergePrize(_prize)
    # 设置活动数据
    _setData = {}
    _setData["v"] = _info["reclist"]
    g.m.wangzhezhaomufun.setPeiYangInfo(uid, _hdinfo, _setData)
    _prize = _con["p"]
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_peiyangprize', 'idx': _idx, "prize": _prize})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['priyang'] = _info
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