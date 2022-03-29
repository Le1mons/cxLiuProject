#!/usr/bin/python
#coding:utf-8
import sys

if __name__ == "__main__":
    sys.path.append("..")
import g

'''
跨服战争霸赛战斗日志
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1,"d":{}}
    uid = conn.uid
    _resData = {}
    _resData['log'] = g.m.crosszbfun.getZBFightLog(uid)
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = g.mdb.find1("userinfo", {"binduid": "666"})['uid']
    g.debugConn.uid = uid
    print doproc(g.debugConn,['57b3fce96a5d0905cc74c975'])