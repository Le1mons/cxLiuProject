#!/usr/bin/python
#coding:utf-8
'''
地图服务器
启动本文件需要3个参数，默认从启动文件中传入
如：python mapserver.py 监听端口号

@author：刺鸟
@email：4041990@qq.com
'''

import sys,os,socket,time
import threading,base64
sys.path.append('..')
sys.path.append('api/')
sys.path.append(os.getcwd())
from twisted.python import log
from twisted.internet import task
import yapi

ENV = os.environ
serverType = "" #进程服务类型
port = 6288 #默认端口

#从start启动时，复写参数
if '_GAMEPORT_' in ENV:
    port = ENV['_GAMEPORT_']
if '_SERVERTYPE_' in ENV:
    serverType = ENV['_SERVERTYPE_']

#============================
import g,config,traceback,socketpack,bindarea
from lib.httpserver import httpServer
g.config = config.CONFIG
#根据port重置config里的sid和sname
g.port = port
# g.config['SVRINDEX'] = bindarea.getSidByPort(g.port,g.config)
# g.svridx = g.config['SVRINDEX']
g.config['servername'] = bindarea.getSNameByPort(g.port,g.config)
#获取当前进程的顺序
for __i,__port in enumerate(g.config['gameSvr']):
    if int(__port)==int(g.port):
        g.portIndex = __i
        g.setCrossServerQueueCache(__i)

g.event.emit("resetBindOver")

try:
    import wingdbstub
    wingdbstub.Ensure()
except Exception,e:
    print "not found WingIde debugger"

LASTSIGN = set()

class Server(g.tw.Protocol):
    #有客户端接入
    def connectionMade(self):
        #print 'connectionMade'
        self.freeTimes = 0
        self.sess = None
        self.sessid = ""
        self.transport.getHandle().setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF,32*1024)
        self.clientip = self.transport.getPeer().host
        self.isLocal = (isinstance(self.clientip,basestring) and (self.clientip.startswith('10.0.') or self.clientip.startswith('192.168.')))
        self.freeTimes = 0
        self.addFreeTimes()
        self.reponseData = []
        self.inProcessLock = {} #进程内API锁，防止mc异步数据导致跨进程锁没能锁住的问题
        self.lastRequest = {}

    #有客户端断开
    def connectionLost(self,reason):
        pass
        #print 'connectionLost'

    def addFreeTimes (self):
        if not self.transport.connected:return
        self.freeTimes += 5
        #当客户端指定时间内没有数据过来时 关闭闲置连接
        if self.freeTimes>=90:
            self.loseConnection('autoLose')
        else:
            g.tw.reactor.callLater(5,self.addFreeTimes)

    #收到客户端发来数据
    def dataReceived(self, msg):
        if not httpServer.isHttpReq(msg):
            return self.loseConnection('notHttp')
        self.freeTimes = 0

        info = g.Dict(httpServer.parseHead(msg))
        #a=接口 d=数据 s=sid
        #http://127.0.0.1:7288/?a=getmsg&d=[1,2,3,4]&s=sid
        if info.request.a == None or info.request.a=="":
            return self.loseConnection('noData')
        
        #通过sid获取缓存数据
        if info.request.s!=None:
            clientSid = info.request.s
            
            
            import hashlib
            import time
            
            try:
                signTxt = ( str(info.request.a) +""+ str(info.request.s) +""+ str(info.request.k) +""+ str(info.request.d)+""+ str(info.request.tm) +"BBe6O82s4gSU")
                m2 = hashlib.md5()   
                m2.update(signTxt)            
                mysign = m2.hexdigest()
                
                if str(mysign).lower() != str(info.request.sign).lower():
                    self.response({"s":-9998,'errmsg':"请求校验错误 请确认客户端是否最新版本"})
                    self.send()
                    return
                
                #if int(time.time()*1000) - int(info.request.tm) > 30000:
                #    self.response({"s":-9998,'errmsg':"请求已过期"})
                #    self.send()
                #    return                    
                
                if mysign in LASTSIGN:
                    LASTSIGN.remove(mysign)
                    self.response({"s":-9997,'errmsg':"重复的请求"})
                    self.send()
                    return
                
                #避免重复请求
                LASTSIGN.add(mysign)
                if len(LASTSIGN)>50:
                    LASTSIGN.pop()
                
            except:
                pass
            
            if self.sessid!=clientSid or self.sess == None:
                if clientSid!=None and len(clientSid)>0:
                    _cacheUid =  g.mc.get(clientSid)
                    if _cacheUid!=None:
                        self.sess = g.m.sess.Session(_cacheUid)
                    else:
                        self.sess = None

                    if self.sess!=None:
                        _uid = self.sess.get("uid")
                        _cacheSid = self.sess.get("sid")
                        if _uid!=None and _cacheSid == clientSid:
                            self.uid = _uid

                    self.sessid = clientSid

        #记录客户端http版本&是否支持gzip
        if not hasattr(self,"clientInfo"):
            self.clientInfo = {}
            self.clientInfo['gzip'] = False
            self.clientInfo['version'] = '.'.join(info.version)

            if 'Accept-Encoding' in info.header and info.header['Accept-Encoding'].find('gzip')!=-1:
                self.clientInfo['gzip'] = True

        _file = 'api_'+info.request.a
        self.doCode(_file,info.request)

    def doCode (self,api,data):
        
        if 'd' in data and data['d'].find(chr(8))!=-1:
            d2 = data['d'].split(chr(8))
            keylen = int(d2[0])/78;
            od = d2[1]
        
            arr = []
            for i in xrange(len(od), 0, -keylen ):
                s = i-keylen
                if s<0:s=0
                arr.append(od[s:i])
            arrText = ''.join(arr)
            data['d'] = base64.b64decode(arrText)
        
        def success(arg):
            _ipLockKey = "IP_APILOCK_" + api
            if _ipLockKey in self.inProcessLock:
                del self.inProcessLock[_ipLockKey]
            
            if hasattr(self,'uid') and len(self.uid)>0:
                _cacheKey = "APILOCK_" + api
                g.m.sess.remove(self.uid,_cacheKey)
                #每次接口的随机值
                _cacheKey_randCode = "APIRANDCODE"
                g.m.sess.remove(self.uid,_cacheKey_randCode)

        def logError(excp):
            _ipLockKey = "IP_APILOCK_" + api
            if _ipLockKey in self.inProcessLock:
                del self.inProcessLock[_ipLockKey]

            uid = ''
            if hasattr(self,'uid'):
                uid=self.uid
                _cacheKey = "APILOCK_" + api
                g.m.sess.remove(self.uid,_cacheKey)

            _errorStr = g.C.STR("{1} error_{2}",str(api),uid)
            import traceback
            _trace = traceback.format_exc()
            g.weblog.error(_errorStr + _trace)
            print 'doCodeError',api, _trace
            self.loseConnection('doApiError',_errorStr + _trace)

        def threadedFunction ():
            procfun = __import__(api)
            if g.ispypy:procfun.str = g._str
            args = []
            if 'isgm' in data:
                args = data
            else:
                if 'd' in data and len(data['d'])>0: args = g.minjson.read(data['d'])
            
            #处理进程内锁
            '''
            同一次登陆通常是在同一个进程内，除了mc跨进程锁定之外，在进程内在增加1个请求锁定，防止mc的异步性导致绕过锁
            除了充值外，其他接口都进程内锁定
            '''
            if api.find('chongzhi_pay')==-1:
                _ipLockKey = "IP_APILOCK_" + api
                _ipLockInfo = self.inProcessLock.get(_ipLockKey,None)
                _nmt = time.time() * 1000
                if _ipLockInfo!=None and _nmt - _ipLockInfo < 10*1000:
                    self.response({"s":-1050})
                    self.send()
                    return
                self.inProcessLock[_ipLockKey] = _nmt
            
            #跨进程锁
            if hasattr(self,'uid') and len(self.uid)>0:
                _cacheKey = "APILOCK_" + api
                _cacheInfo = g.m.sess.get(self.uid,_cacheKey)

                _nmt = time.time() * 1000
                if _cacheInfo!=None and _nmt - _cacheInfo < 60*1000:
                    self.response({"s":-105})
                    self.send()
                    return

                g.m.sess.set(self.uid,_cacheKey,_nmt)
                _cacheKey_randCode = 'APIRANDCODE'
                g.m.sess.set(self.uid,_cacheKey_randCode,g.C.getUniqCode())

            try:
                self.lastRequest['api'] = api
                self.lastRequest['args'] = args

                _start = int(round(time.time() * 1000))
                _defer = procfun.proc(self,args)
                success(_defer)
                _end = int(round(time.time() * 1000))
                
                if hasattr(g,'mdb'):
                    g.mdb.update('apiCount', {"api":api}, {'$inc': {'callnums': 1,'needtimes':_end-_start}},upsert=True)
                #_defer.addErrback(logError)
                #_defer.addCallback(success)
            except Exception,e:
                logError(e)

        #开发机主进程中执行 以便发现阻塞点
        if os.name=='nt':
            threadedFunction()
        else:
            g.tw.reactor.callInThread(threadedFunction)

    #断开连接
    def loseConnection (self,why="",extInfo=""):
        if(why!='notHttp'):
            if self.isLocal and extInfo!="":
                self.doSend("~serverError~服务端报错，请截图：\n"+extInfo)
            else:
                self.doSend('err')
        self.transport.loseConnection()

    #通过HTTP方式回复数据 可以调用多次 在最后合并后一次send给http客户端
    def response (self,msg,api=""):
        try:
            if self.isLocal and api=="" and str(msg['s']) == '1':
                yapi.addApi( self.lastRequest['api'] , self.lastRequest['args'], msg )
        except:
            pass
        
        d = socketpack.s2c(msg,api)
        self.reponseData.append(d)

    #发送所有rensponse数据给客户端
    def send (self):
        if len(self.reponseData) > 0 :
            self.doSend(''.join(self.reponseData))
            self.reponseData=[]
        else:
            self.loseConnection('noData')

    def doSend(self,msg):
        if not self.transport.connected or msg is None:
            return

        msg = g._str(msg)
        _gzip = False
        _ver = '1.1'
        if hasattr(self,"clientInfo"):
            _gzip = self.clientInfo['gzip']
            _ver = self.clientInfo['version']
        msg = httpServer.response(msg,_gzip,_ver)

        #try:
            #http://www.163py.com/pages/122/127/476/article_index.html
        #    self.transport.getHandle().sendall(msg)
        #except:
        g.tw.reactor.callFromThread(self.transport.write,msg)


#启动服务器
if __name__=='__main__':
    log.startLogging(sys.stdout)
    f = g.tw.Factory()
    f.protocol = Server
    g.tw.reactor.listenTCP(int(port),f)

    mqclient = g.m.mymq.createMQClient("serverweb"+str(port))
    #===================
    def mqOnReceive(msg):
        def threadedFunction ():
            try:
                j = g.m.myjson.loads(msg)
                procfun = __import__('mqapi_'+ str(j['api']))
                _defer = procfun.proc(j['data'])
            except Exception,e:
                logError(e)
        if os.name=='nt':
            threadedFunction()
        else:
            g.tw.reactor.callInThread(threadedFunction)
    #===================
    mqclient.event.on('onReceive',mqOnReceive)
    for __i, __port in enumerate(g.config['gameSvr']):
        if int(__port) == int(port) and __i == 0:
            crosseventtask = task.LoopingCall(g.crosschatfun.gpjjcQueue.getQueue)
            crosseventtask.start(1)
            break

    g.tw.reactor.run()