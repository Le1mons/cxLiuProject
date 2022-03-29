#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
'''
活动 - 王者招募-招募选择掉落英雄
'''
def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [num:int] 招募次数
    :param key:
    :return:
            {'d': {'prize': [{'a': 'hero', 'n': 1, 't': '25066'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'}],
        'zhaomu': {'num': 10, 'reclist': []}},
        's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _idx = int(abs(data[0]))

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    _con = _hdinfo["data"]["openinfo"]["zhaomu"]
    # 判断是否可以选择
    if len(_con["mainhero"]) <= _idx:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    _chkData["idx"] = _idx
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
    _idx = _chkData["idx"]

    # 获取招募信息
    _info = g.m.wangzhezhaomufun.getZhaoMuInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["zhaomu"]

    # # 合并奖励
    # _prize = g.mergePrize(_prize)
    # 设置活动数据
    _setData = {}
    _setData["choose"] = _idx
    g.m.wangzhezhaomufun.setZhaoMuInfo(uid, _hdinfo, _setData)

    # 获取招募信息
    _info = g.m.wangzhezhaomufun.getZhaoMuInfo(uid, _hdinfo)
    _resData = {}
    _resData['zhaomu'] = _info

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