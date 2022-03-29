#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-一键配装
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1


    # # 获取公平竞技场是否开启
    # _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    # if not _chkOpen["act"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData

    _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id,jifen,tq,winnum,fightnum,uid,shipin,baoshi,lock')
    gud = g.getGud(uid)
    _gpjjclv = gud["gpjjclv"]

    _lvCon = g.GC["pro_gpjjcplayerlv"][str(_gpjjclv)]

    _con = g.GC["gpjjchero"]
    for hid, info in _con.items():
        # 如果hid在锁住
        if hid in _myinfo.get("lock", []):
            continue
        for k, v in info.items():
            if k not in _lvCon:
                continue
            # 如果当前等级没有开启这个装备
            if v not in _lvCon[k]:
                continue
            _myinfo[k][hid] = v

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

    _myinfo = _chkData["myinfo"]


    # 设置玩家数据
    g.m.gongpingjjcfun.setData(uid, {"baoshi": _myinfo["baoshi"], "shipin":_myinfo["shipin"]})

    # 设置玩家的默认阵容
    _ctype = "gpjjc_con"
    g.setAttr(uid, {"ctype": _ctype}, {"baoshi": _myinfo["baoshi"], "shipin":_myinfo["shipin"]})

    _resData["myinfo"] = _myinfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xiaoxiannv')
    print g.debugConn.uid
    _data = ['1001', {"shipin": "656605", "baoshi":"1"}]
    print doproc(g.debugConn,_data)