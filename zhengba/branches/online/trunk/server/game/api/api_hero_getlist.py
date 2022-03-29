#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    
import g

'''
英雄 - 获取英雄列表
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _heroList = g.m.herofun.getMyHeroList(uid)
    _jjcHeros = g.m.zypkjjcfun.getDefendHero(uid)
    _jjcHeros = [_jjcHeros[i] for i in _jjcHeros]
    _kMap = {}
    for ele in _heroList:
        _tid = str(ele["_id"])
        del ele["_id"]
        ele.update({'tid': _tid})
        _kMap[_tid] = ele


    _res["d"] = {"list":_kMap,"jjchero":_jjcHeros}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = []
    _r = doproc(g.debugConn, data)
    print _r
    if 'errmsg' in _r: print _r['errmsg']