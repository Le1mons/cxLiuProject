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
import threading
sys.path.append('..')
sys.path.append('api/')
sys.path.append(os.getcwd())
from twisted.python import log
import lib.crontab as crontab

ENV = os.environ
serverType = "" #进程服务类型

#从start启动时，复写参数
if '_GAMEPORT_' in ENV:
    port = ENV['_GAMEPORT_']
if '_SERVERTYPE_' in ENV:
    serverType = ENV['_SERVERTYPE_']

#============================
import g,config,traceback,socketpack,time
g.config = config.CONFIG

#注意：timer开头的API里取到的SVRINDEX和servername永远是主区的
#如果需要处理合区相关的逻辑，需要自行处理

cron = crontab.Crontab()
timelistConf = {}

def dataReceived(msg):
    try:
        data = g.minjson.read(msg)
        if data['act']=='RA':
            addTimer(data)
        elif data['act']=='ST':
            data['S'] = int(time.time()) + data['S']
            addTimer(data)
        elif data['act']=='CT':
            delTimer(data['ID'])
    except:
        pass
    #{"act":"ST","S":s,"F":fun,'A':arg,"K":karg}
    #{"act":"RA","S":s,"F":fun,'A':arg,"K":karg}
    #{"act":"CT","ID":tid}

def doFun (tid):
    global timelistConf
    if not tid in timelistConf: return
    conf = timelistConf[tid]

    _file = 'timer_'+conf['F']
    
    donotPrint = ['timer_sys_sendmsg','timer_getemailfromcross']
    if not _file in donotPrint: #这个接口1min一次，不要打日志了 
        _log = "{0} serverTimer start".format(_file)
        print _log
        g.timerlog.info(_log)

    doCode(_file,conf['A'],conf['K'])

    if not _file in donotPrint:
        _log = "{0} serverTimer finish".format(_file)
        print _log
        g.timerlog.info(_log)

def doCode (api,arg,karg):
    def threadedFunction ():
        try:
            procfun = __import__(api)
            procfun.proc(arg,karg)
        except Exception,e:
            errmsg = traceback.format_exc()
            g.timerlog.error(str(errmsg))
            print 'doCodeError',api, errmsg

    #开发机主进程中执行 以便发现阻塞点
    if os.name=='nt':
        threadedFunction()
    else:
        g.tw.reactor.callInThread(threadedFunction)

#获取数据连接
def getDB():
    if serverType == 'crosstimer':
        return g.crossDB
    return g.mdb

def initFromDB ():
    #tid,timestr,timeout,fun,arg,karg
    global timelistConf,cron
    now  = int(time.time())
    getDB().delete('timerlist',where={"timeout":{"$lt":now}}) #清理过时事件，包括-1的
    res = getDB().find('timerlist',where={"timeout":{"$gt":now}} ) #获取未来的事件
    
    for v in res:
        timelistConf[v['timerid']] = v
        cron.add(v['timerid'],v['timestr'])


def addTimer(d):
    global cron,timelistConf
    
    timerid = g.C.getUniqCode()
    if 'timerid' in d['K']:
        timerid = d['K']['timerid']

    data = {
        "timerid":timerid,
        "F":d['F'],
        "A":d['A'],
        "K":d['K'],
        "timestr":d['S']
    }
    if type(d['S']) == type(1):
        data['timeout'] = int(d['S']) + 5
    else:
        data['timeout'] = -1
    
    print 'addTimer',data

    timelistConf[timerid] = data
    cron.add(timerid,d['S'])
    getDB().insert('timerlist',data)

def delTimer(tid):
    global cron,timelistConf

    if tid in timelistConf:
        del timelistConf[tid]
    cron.delTasks(tid)


#从timer.json中加载初始化定时器
def timerInit():
    #添加系统定时器
    if serverType == 'crosstimer':
        conf = g.GC['crosstimer']
    else:
        conf = g.GC['timer']

    for t in conf:
        g.m.timer.runat(t["timestr"],t["api"], *t["arg"],**t["karg"])

class Server(g.tw.Protocol):
    def dataReceived(self, msg):
        _res = "selfpingreturnok"
        
        ckTimes = 0
        checkMDB = None
        #检测数据库
        try:
            checkMDB = g.mdb.client.server_info()
            checkCrossMDB = g.crossDB.client.server_info()
        except:
            pass
        if checkMDB!=None:
            ckTimes+=1
        
        if checkCrossMDB!=None:
            ckTimes+=1
            
        #检测MC
        try:
            g.mc.set("selfCheck","1")
            if g.mc.get("selfCheck")=="1":
                ckTimes+=1
            
            g.crossMC.set("selfCheck","1")
            if g.crossMC.get("selfCheck")=="1":
                ckTimes+=1            
        except:
            pass

        if ckTimes<4:
            _res = "ping error"

        self.transport.write(_res)

#启动服务器
if __name__=='__main__': 
    log.startLogging(sys.stdout)
    if serverType == 'crosstimer':
        # 添加npc
        g.m.crosswzfun.addNpc()
        # g.tw.reactor.callInThread(g.m.crosswzfun.addNpc)
        #修复王者荣耀事件
        g.tw.reactor.callInThread(g.m.crosswzfun.runAllEvent)
        # g.m.crosswzfun.runAllEvent()

    g.m.mymq.createMQClient()
    g.event.on("timerInit",timerInit)
    g.m.mymq.setTimerClient()
    g.m.mymq.mqclient.onReceive = dataReceived

    initFromDB()
    cron.emit = doFun
    
    if os.path.exists('./UNIX_TIMER_PING.d'):os.unlink('./UNIX_TIMER_PING.d')
    
    if os.name != 'nt':
        f = g.tw.Factory()
        f.protocol = Server
        g.tw.reactor.listenUNIX("./UNIX_TIMER_PING.d", f)

    cron.start()
    g.tw.reactor.run()
