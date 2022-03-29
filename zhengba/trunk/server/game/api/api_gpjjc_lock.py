#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-锁定英雄
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _hid = str(data[0])


    # # 获取公平竞技场是否开启
    # _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    # if not _chkOpen["act"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData


    gud = g.getGud(uid)
    _gpjjclv = gud["gpjjclv"]
    _lvCon = g.GC["gpjjcplayerlv"][str(_gpjjclv)]
    _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id,jifen,tq,winnum,fightnum,uid,shipin,baoshi,lock,skin')


    # 判断英雄是否在可以上阵
    if _hid not in g.GC["pro_gpjjc_hero"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_wear_res_-1')
        return _chkData


    _chkData["hid"] = _hid
    _chkData["myinfo"] = _myinfo
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
    _hid = _chkData["hid"]
    _myinfo = _chkData["myinfo"]
    # 判断是否在里面
    if _hid in _myinfo["lock"]:
        _myinfo["lock"].remove(_hid)
    else:
        _myinfo["lock"].append(_hid)

    # 设置玩家数据
    g.m.gongpingjjcfun.setData(uid, {"lock": _myinfo["lock"]})
    _resData["myinfo"] = _myinfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1001', {"shipin": "656605", "baoshi":"1"}]
    print doproc(g.debugConn,_data)