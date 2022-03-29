#!/usr/bin/python
#coding:utf-8
'''
查看城战信息
'''

import sys,os,socket
sys.path.append('game')
import g
_cityid = None
args = sys.argv
if len(args)<2: 
    print 'not cityid in environ'

else:
    _cityid = str(args[1])


#HTTP PING进程
class SocketPingByApi:
    def __init__ (self,port,data):
        print 'SocketPing __init__'
        self.errTimers = 0
        #self.svrMana = svrMana
        self.running = True
        self.port = port
        self.data = data
    
    def stop(self):
        self.running = False
        
    def start (self):
        if not self.running:return
        try:
            mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
            mysocket.connect(('127.0.0.1',self.port))
            #TODO 可以把接口改为参数传入
            mysocket.send( chr(1) + chr(1)+ 'cityfight_chkdata'+chr(4) + self.data + chr(2) )
            #res = mysocket.recv(1024)
            mysocket.close()
        except:
            print 'RUNERR'


def start(port,data):
    ping = None
    ping = SocketPingByApi(port,data)
    ping.start()
    #g.tw.reactor.callLater(10,ping.start)
        
    return 'RunRes======',ping


if __name__=='__main__':
    _host =  g.conf['DBCONFIG']['host']
    _port =  g.conf['fightSvr']
    if _cityid != None:
        _data = g.C.STR("[{1}]",_cityid)
        start(_port,_data)
    else:
        print "cityid is None"
