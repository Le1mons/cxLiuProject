#!/usr/bin/python
#coding:utf-8

import g
import socketmana

def proc(conn,data):
    #todo 检测data参数合法性
    d = g.m.myjson.loads(data)
    uid = d[0]
    _onlineConn = socketmana.data.get(uid)
    
    if _onlineConn!=None:
        def callback():
            _onlineConn.lostClear()
            _onlineConn.transport.loseConnection()
            
        #账号重复登录
        _onlineConn.sendAPI('otherClientlogin','',callback)

    socketmana.data.bind(uid,conn)
    conn.sendAPI("socketSucc")
	
