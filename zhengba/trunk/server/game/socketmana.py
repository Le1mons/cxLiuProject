#!/usr/bin/python
#coding:utf-8
'''=================
WebGame Python服务端 by 刺鸟
Email:4041990@qq.com
=================='''

class SocketMana:
    uid2Conn = {}
    def __init__ (self):
        pass
    
    def bind (self,uid,conn):
        conn.uid = uid
        SocketMana.uid2Conn[uid] = conn
    
    def unbind (self,uid):
        if uid in SocketMana.uid2Conn:
            del SocketMana.uid2Conn[uid]
    
    def getAll (self):
        return SocketMana.uid2Conn
    
    def get (self,uid):
        if uid in SocketMana.uid2Conn:
            return SocketMana.uid2Conn[uid]
        else:
            return None
        

data = SocketMana()

if __name__=='__main__':
    data.bind('a','b')
    print data.getAll()