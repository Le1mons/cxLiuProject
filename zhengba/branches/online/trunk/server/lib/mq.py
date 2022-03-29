#!/usr/bin/python
#coding:utf-8
'''
@author：刺鸟
@email：4041990@qq.com
'''

import sys,os,socket
sys.path.append('..')
sys.path.append(os.getcwd())
import event
from twisted.python import log
import Queue,g
import socketpack

class MQServerProtocol(g.tw.Protocol):
    #有客户端接入
    def connectionMade(self):
        self.queue = [] #Queue.Queue(-1)
        self.host = self.transport.getPeer().host
        self.port = self.transport.getPeer().port
        self.sessionno = self.transport.sessionno
        self.transport.getHandle().setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF,32*1024)
        #self.sendQueue()

    #有客户端断开
    def connectionLost(self,reason):
        pass

    #收到客户端发来数据
    def dataReceived(self, msg):
        #print 'MQServerProtocol dataReceived',str(repr(msg))
        self.factory.server._onProtocolReceived(self,msg)
    
    '''
    def sendQueue (self):
        if self.queue.empty()==False:
            msg = self.queue.get()
            msg = chr(1) + chr(4) + msg + chr(2)
            self._send(msg)
        g.tw.reactor.callLater(0.0001,self.sendQueue)
    '''

    def send (self,msg):
        msg = chr(1) + chr(4) + msg + chr(2)
        self.queue.append(msg)
        self._send()

    def _send(self):
        if not self.transport.connected or len(self.queue)==0:
            return
        data = ''.join(self.queue)
        self.queue=[]
        self.transport.write(str(data))

class MQServer():
    def __init__ (self):
        self.event = event.EventEmitter()
        pass

    def bind (self,port):
        f = g.tw.Factory()
        f.server = self
        f.protocol = MQServerProtocol
        g.tw.reactor.listenTCP(port,f)

    def send (self):
        pass
    
    def _onProtocolReceived (self,protocol,msg):
        def _packover (api,msg):
            if msg=="ping":
                return protocol.send("reping")
            else:
                self.onReceive(protocol,msg)

        socketpack.c2s(protocol,msg,_packover)
    
    def onReceive (self,protocol,msg):
        #对外方法，可复写
        pass
    
#===============================
class MQClientProtocol(g.tw.Protocol):
    def __init__( self ):
        pass
    #创建完成时，向调度服务器发起注册
    def connectionMade( self ):
        self.factory.client.work = True
        self.factory.client.onStart()
        self.transport.getHandle().setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF,32*1024)

        self.lostPing = 0
        self.ping()

    #调度服务器关闭
    def connectionLost( self, reason ):
        self.factory.client.work = False
        pass

    #收到调度服务器的数据
    def dataReceived(self,msg):
        #print 'MQClientProtocol dataReceived',str(repr(msg))
        self.factory.client._onProtocolReceived(msg)
    
    #ping
    def ping (self):
        #print 'MQClientProtocol ping.....'
        self.factory.client.send('ping')
        self.lostPing += 1
        
        if self.lostPing>5:
            #ping无响应 断开链接触发重链机制
            self.transport.loseConnection()
        else:
            g.tw.reactor.callLater(5,self.ping)
    
    #收到ping回应 重置计数器
    def getReping (self):
        #print 'MQClientProtocol getReping.....'
        self.lostPing = 0

    #发送数据
    def send(self,data):
        if self.transport.connected:
            self.transport.write(str(data))
    
    def setFactory (self,factory):
        self.factory =factory

class PyClientFactory(g.tw.ClientFactory):
    def startedConnecting(self,connector):
        pass
    
    def setClient (self,client):
        self.client = client

    def buildProtocol(self,addr):
        self.protocol = MQClientProtocol()
        self.protocol.setFactory(self)
        return self.protocol

    def clientConnectionLost(self,connector,reason):
        #print 'PyClientFactory clientConnectionLost'
        connector.connect()#自动重连
        #self.factory.client.work = False

    def clientConnectionFailed(self,connector,reason):
        #print 'PyClientFactory clientConnectionFailed'
        connector.connect()#自动重连
        #self.factory.client.work = False

class MQClient():
    def __init__ (self):
        self.event = event.EventEmitter()        
        self.queue = [] #Queue.Queue(-1)
        self.factory = PyClientFactory()
        self.factory.setClient(self)
        self.work = False
    
    def onStart (self):
        self.event.emit("onStart");
        self.sendQueue()

    def connect (self,port,ip='127.0.0.1'):
        self.event.emit("onConnect");
        g.tw.reactor.connectTCP(
            ip,
            int(port),
            self.factory
        )

    def send (self,msg):
        self.event.emit("onSend",msg);
        msg = chr(1) + chr(4) + msg + chr(2)
        self.queue.append(msg)
        self.sendQueue()
    
    def onReceive (self,msg):
        #对外方法，可复写
        pass

    def _onProtocolReceived (self,msg):
        def _packover (api,msg):
            if msg=='reping':
                self.factory.protocol.getReping()
            else:
                self.event.emit("onReceive",msg);
                self.onReceive(msg)

        socketpack.c2s(self,msg,_packover)

    def sendQueue (self):
        if self.work==True and len(self.queue)>0:
            msg = ''.join(self.queue)
            self.queue=[]
            self.factory.protocol.send(msg)

    #发送数据
    #def _send( self,data):
    #    self.transport.write(data)
        

#启动服务器
if __name__=='__main__':
    #log.startLogging(sys.stdout)
    mqserver = MQServer()
    mqserver.bind(7288)

    
    def aaaa (protocol,msg):
        print 'dddd',len(msg)
        protocol.send('hello...')
    mqserver.onReceive = aaaa

    mqclient = MQClient()
    mqclient.connect(7288)
    def bbbb (msg):
        print 'eee',msg
    mqclient.onReceive = bbbb

    
    import time
    s = time.time()
    for i in xrange(1000):
        mqclient.send('h'*20*1024)
    e = time.time()
    print e-s

    g.tw.reactor.run()