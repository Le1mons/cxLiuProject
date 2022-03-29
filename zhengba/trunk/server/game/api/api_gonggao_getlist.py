#!/usr/bin/python
#coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公告 - 读取公告列表
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
# @g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    _nt = g.C.NOW()
    #读取公告
    _w = {"ctype":"GONGGAO","v.stime":{"$lte":_nt},"$or":[{"v.etime":{"$gte":_nt}},{"v.etime":0}]}
    _rInfo = g.m.gameconfigfun.getGameConfig(_w,"_id,v.title,v.stype,v.content")
    _ggList = []
    for ele in _rInfo:
        _ggList.append(ele["v"])

    _res["d"] = _ggList
    print g.minjson.write(_res)
    return _res

if __name__ == '__main__':
    uid = g.buid("3")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6, 2])