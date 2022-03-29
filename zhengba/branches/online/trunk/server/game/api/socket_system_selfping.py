#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')
    
import g

def proc(conn,data):
    _res = doproc(conn,data)
    conn.sendDo(_res)

def doproc(conn,data):
    _res = "selfpingreturnok"
    
    ckTimes = 0
    checkMDB = None
    #检测数据库
    try:
        checkMDB = g.mdb.client.server_info()
    except:
        pass

    if checkMDB!=None:ckTimes+=1
    
    #检测MC
    try:
        g.mc.set("selfCheck","1")
        if g.mc.get("selfCheck")=="1":ckTimes+=1
    except:
        pass
    
    if ckTimes!=2:
        _res = "ping error"
    
    return (_res)

if __name__=='__main__':
    proc(g.debugConn,[])