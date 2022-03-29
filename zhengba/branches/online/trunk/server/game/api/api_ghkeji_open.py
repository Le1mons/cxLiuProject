#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 公会科技升级
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _data = g.getAttr(uid,{'ctype':'keji_data'})
    _resData = {}
    _resData['resetnum'] = g.m.gonghuifun.getResetNum(uid)
    _resData['kejidata'] = {}
    if _data != None:
        for d in _data:
            _resData['kejidata'].update(d['v'])
            
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['1','1']
    print doproc(g.debugConn,_data)