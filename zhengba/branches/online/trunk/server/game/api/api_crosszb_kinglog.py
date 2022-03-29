#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
王者风范接口
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _dkey = g.m.crosszbfun.dkey_ZBRank()
    _step = g.m.crosszbfun.getZhengBaStep(uid)
    _data = g.crossDB.find('crosszbtoplog',{'dkey':_dkey,'step':_step},fields=['_id'],sort=[['ctime',-1]],limit=20)
    _res['d'] = _data
    return _res
    
    
if __name__ == "__main__":
    uid = g.buid("666")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, [])
    print g.m.crosszbfun.dkey_ZBRank()