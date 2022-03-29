#!/usr/bin/python
#coding:utf-8
'''
战斗监听
'''

import sys,os,socket
sys.path.append('..')
sys.path.append('api/')
sys.path.append(os.getcwd())
from twisted.python import log

ENV = os.environ
serverType = "" #进程服务类型
port = 6101 #默认端口

#从start启动时，复写参数
if '_GAMEPORT_' in ENV:
    port = ENV['_GAMEPORT_']
if '_SERVERTYPE_' in ENV:
    serverType = ENV['_SERVERTYPE_']

#============================
import g,config,socketpack,traceback
import socketmana
import lib.ws as ws
from fightteam import FIGHTTEAM

g.config = config.CONFIG

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
            socketmana.data.unbind(self.uid)
            
        if hasattr(self,'cityid'):
            g.m.fightteamfun.exitCityFight(self.cityid,self)
            
        #print 'connectionLost'

    #收到客户端发来数据
    def dataReceived(self, msg):
        #WS握手
        if msg.lower().find('upgrade: websocket') != -1:
            ws.shake(self,msg)
            return
        #print 'msg==============================',msg,type(msg)
        ws.parse_recv_data(self,msg,self._dataReceived)
    
    #数据解压后，执行解包粘包操作
    def _dataReceived (self,msg):
        #print 'msg==============================',msg,type(msg)
        socketpack.c2s(self,msg,self.packOver)
    
    def packOver (self,api,data):
        _file = 'cfight_'+api
        
        def threadedFunction ():
            try:
                #print 'serverfight file=',_file
                procfun = __import__(_file)
                if(data):
                    _args = g.minjson.read(data)
                else:
                    _args=[]
                procfun.proc(self,_args)
                
                if hasattr(g, 'timeout'):
                    g.timeout.recheck()
                    
            except Exception,e:
                print 'doCodeError',api, traceback.format_exc()

        #开发机主进程中执行 以便发现阻塞点
        if os.name=='nt':
            threadedFunction()
        else:
            g.tw.reactor.callInThread(threadedFunction)
    
    def sendAPI (self,api,data=''):
        msg = str(g.m.socketpack.s2c(data, api))
        return self.send(msg)

    def send (self,msg):
        try:
            msg = str(msg)
            msg = ws.send_data(self,msg)
            return self.sendDo(msg)
        except:
            pass
    

    def sendDo(self,msg):
        if not self.transport.connected or msg is None:
            return
        msg = str(msg)
        g.tw.reactor.callFromThread(self.transport.write,msg)
        #self.transport.write(msg)
        

#启动服务器
if __name__=='__main__':
    log.startLogging(sys.stdout)
    f = g.tw.Factory()
    f.protocol = Server
    g.tw.reactor.listenTCP(int(port),f)
    
    mqclient = g.m.mymq.createMQClient("serversfight")
    #===================
    def mqOnReceive(msg):
        def threadedFunction ():
            #try:
                j = g.m.myjson.loads(msg)
                procfun = __import__('mqapi_'+ str(j['api']))
                _defer = procfun.proc(j['data'])
            #except Exception,e:
                #logError(e)
        if os.name=='nt':
            threadedFunction()
        else:
            g.tw.reactor.callInThread(threadedFunction)
    #===================
    mqclient.event.on('onReceive',mqOnReceive)

    #重现战场信息
    import fightteamfun
    fightteamfun.reBackCityFight()

    # 恢复中断的讨伐义渠战斗
    import tfyqfun
    tfyqfun.restartYQFight()
    
    g.tw.reactor.run()
