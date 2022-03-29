#!/usr/bin/python
#coding:utf-8
'''
系统认证 - 心跳
'''

import g


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

def doproc(conn,data):
    _res = {"s":1}
    _nt = g.C.NOW()

    if not hasattr(conn,"uid"):
        _res["d"] = _nt
        return (_res)

    uid = conn.uid
    gud = g.getGud(uid)

    #心跳时间
    gud["lasttime"] = _nt
    g.m.userfun.updateUserInfo(uid,{'lasttime':_nt})

    g.m.gud.setGud(uid,gud)
    #更新每日在线时间
    g.m.onlineprizefun.getOnTime(uid)
    _res["d"] = _nt
    return (_res)