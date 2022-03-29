#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-穿戴英雄装备
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _hid = str(data[0])
    _wearData = data[1]

    # # 获取公平竞技场是否开启
    # _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    # if not _chkOpen["act"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData


    gud = g.getGud(uid)
    _gpjjclv = gud["gpjjclv"]
    _lvCon = g.GC["pro_gpjjcplayerlv"][str(_gpjjclv)]

    # 判断英雄是否在可以上阵
    if _hid not in g.GC["pro_gpjjc_hero"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_wear_res_-1')
        return _chkData

    for k, v in _wearData.items():
        # 判断baoshi
        if k == "skin":
            _skinCon = g.GC["accessories"]
            if v and v not in _skinCon:
                _chkData['s'] = -5
                _chkData['errmsg'] = g.L('gpjjc_wear_res_-2')
                return _chkData
            # 如果hid不存在
            if v and _hid not in _skinCon[v]["hid"]:
                _chkData['s'] = -4
                _chkData['errmsg'] = g.L('gpjjc_wear_res_-2')
                return _chkData
            continue

        if k not in _lvCon:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('gpjjc_wear_res_-2')
            return _chkData
        if v not in _lvCon[k]:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('gpjjc_wear_res_-3')
            return _chkData


    _chkData["weardata"] = _wearData
    _chkData["hid"] = _hid
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
    _wearData = _chkData["weardata"]
    # 获取玩家数据
    _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id,jifen,tq,winnum,fightnum,uid,shipin,baoshi,skin,lock')
    _setData = {}
    for k, v in _wearData.items():
        if k not in _myinfo:
            continue


        _myinfo[k][_hid] = v
        _setData[k] = _myinfo[k]
    # 设置玩家数据
    g.m.gongpingjjcfun.setData(uid, _setData)
    # 设置玩家的默认阵容
    _ctype = "gpjjc_con"
    g.setAttr(uid, {"ctype": _ctype}, _setData)


    _resData["myinfo"] = _myinfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('ysr1')
    print g.debugConn.uid
    _data = ["11086", {"skin":"1108001"}]
    print doproc(g.debugConn,_data)
