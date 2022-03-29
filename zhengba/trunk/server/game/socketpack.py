#!/usr/bin/python
#coding:utf-8
'''=================
WebGame Python服务端 by 刺鸟
Email:4041990@qq.com
=================='''

import sys,g
reload(sys)
sys.setdefaultencoding('utf8')

def c2s (conn,s,callFun):
    s = str(s)
    
    if not hasattr(conn,'socketLeftString'):
        conn.socketLeftString = ""    

    if conn.socketLeftString !='':
        s = conn.socketLeftString + s

    if len(s)<6:
        conn.socketLeftString = s
        return

    if s[0:1]==chr(1):
        _callbackKey = s[1:2]
        _endChrIndex = s.find(chr(2))
        #如果没有结束，则继续等待
        if _endChrIndex==-1:
            conn.socketLeftString =s
            return

        _dataMain = s[1:_endChrIndex]

        if _dataMain.find(chr(4))==-1:
            conn.socketLeftString = ""
            return

        conn.socketLeftString=''
        _dataArr = _dataMain.split(chr(4))
        
        _code = _dataArr[0]
        _data = _dataArr[1]

        callFun(_code, _data)

        if _endChrIndex+1 != len(s):
            _leftData = s[_endChrIndex+1:]
            #g.tw.reactor.callLater(0.02,c2s,conn,_leftData,callFun)
            c2s(conn,_leftData,callFun)
    else:
        print 'pack.cron2s error : s[:1]!=chr(1)',repr(s)
        conn.socketLeftString=''

def s2c (data,api=""):
    if type(data)!=type('') and type(data)!=type(u'') and type(data)!=type(1):
        data = g.m.myjson.write(data)
    data = chr(1) + str(api) + chr(4) + data + chr(2)
    return  data

if __name__=='__main__':
    print repr(s2c(321,'123'))
    a = '1\0'
    print repr(a)