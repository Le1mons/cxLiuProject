#!/usr/bin/python
#coding:utf-8
'''
启动本文件需要3个参数，默认从启动文件中传入
如：python mapserver.py 监听端口号

@author：刺鸟
@email：4041990@qq.com
'''

import sys,os,socket
sys.path.append('..')
sys.path.append('api/')
sys.path.append(os.getcwd())
from twisted.python import log

ENV = os.environ
serverType = "" #进程服务类型
port = 6001 #默认端口

#从start启动时，复写参数
if '_GAMEPORT_' in ENV:
    port = ENV['_GAMEPORT_']
if '_SERVERTYPE_' in ENV:
    serverType = ENV['_SERVERTYPE_']

#============================
import g,config,socketpack,traceback
import socketmana
import lib.ws as ws
g.config = config.CONFIG

#注意：socket开头的API里取到的SVRINDEX和servername永远是主区的
#如果需要处理合区相关的逻辑，需要自行处理

try:
    import wingdbstub
    wingdbstub.Ensure()
except Exception,e:
    print "not found WingIde debugger"

class Server(g.tw.Protocol):
    #有客户端接入
    def connectionMade(self):
        self.attr={} #主要保存客户端的连接类型
        self.socketLeftString = '' #socket传输中需要粘包的数据
        #print 'connectionMade',self
        self.transport.getHandle().setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF,32*1024)

    #有客户端断开
    def connectionLost(self,reason):
        if hasattr(self,'uid'):
            self.lostClear()
    
    def lostClear (self):
        if hasattr(self,'uid'):
            socketmana.data.unbind(self.uid)
            del self.uid

    #收到客户端发来数据
    def dataReceived(self, msg):
        #WS握手
        if msg.lower().find('upgrade: websocket') != -1:
            ws.shake(self,msg)
            return
        ws.parse_recv_data(self,msg,self._dataReceived)
    
    #数据解压后，执行解包粘包操作
    def _dataReceived (self,msg):
        socketpack.c2s(self,msg,self.packOver)
    
    def packOver (self,api,data):
        _file = 'socket_'+api
        #print 'packOver',_file,repr(data)
        def threadedFunction ():
            try:
                procfun = __import__(_file)
                if g.ispypy:procfun.str = g._str
                procfun.proc(self,data)
            except Exception,e:
                print 'doCodeError',api, traceback.format_exc()

        #开发机主进程中执行 以便发现阻塞点
        if os.name=='nt':
            threadedFunction()
        else:
            g.tw.reactor.callInThread(threadedFunction)
    
    def sendAPI (self,api,data='',callback=None):
        msg = g._str(g.m.socketpack.s2c(data, api))
        return self.send(msg,callback)

    def send (self,msg,callback=None):
        msg = g._str(msg)
        msg = ws.send_data(self,msg)
        return self.sendDo(msg,callback)

    def sendDo(self,msg,callback=None):
        if not self.transport.connected or msg is None:
            if callback!=None : callback()
            return
        msg = g._str(msg)

        #try:
            #http://www.163py.com/pages/122/127/476/article_index.html
        #    self.transport.getHandle().sendall(msg)
        #except:
        g.tw.reactor.callFromThread(self.transport.write,msg)

        if callback!=None : callback()

#启动服务器
if __name__=='__main__':
    log.startLogging(sys.stdout)
    f = g.tw.Factory()
    f.protocol = Server
    g.tw.reactor.listenTCP(int(port),f)
    g.m.mymq.createMQServer()
    g.tw.reactor.run()
