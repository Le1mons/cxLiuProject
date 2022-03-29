#!/usr/bin/python
#coding:utf-8
'''
@author：刺鸟
@email：4041990@qq.com
'''
#主控服务器
import lib.tw as tw
import urllib2
import os,sys,subprocess,socket,copy,time
import lib.memcache as mem
import selfping
from twisted.python import log

ispypy = (sys.version.find('PyPy')!=-1)

ROOTPATH = os.getcwd()
if ROOTPATH[-1] != '/' and ROOTPATH[-2:] != '\\':
    ROOTPATH += os.sep
sys.path.extend([ROOTPATH+'game'])

import config,lib.file

ROOT = ROOTPATH
conf = config.CONFIG

class SvrMana:
    def __init__ (self):
        self.processDict={}
        
    def start (self):
        _ver = conf['VER']
        #启动socket服务器
        if 'socketSvr' in conf:
            self.startGamePy(conf['socketSvr'],'socketSvr','game/serversocket.py')
            
        #不是跨服服务器正常启动进程
        if _ver != 'cross':
            #启动游戏逻辑进程
            for port in conf['gameSvr']:
                self.startGamePy(port,'gamesvr','game/serverweb.py')
    
            #启动fight服务器
            '''if 'fightSvr' in conf:
                self.startGamePy(conf['fightSvr'],'fightsvr','game/serversfight.py')'''
    
            # #统计进程
            # if conf['VER'] == 'default':
            self.openShell('sign','game/serversign.py')
            #启动定时器
            self.startGamePy(0,'timer','game/servertimer.py')
        else:
            #跨服定时器，区分逻辑定时器，便于区分和后期拓展
            self.startGamePy(0,'crosstimer','game/servertimer.py')

        self.savePid()
        
        selfping.start('memcache',conf['MEMCACHE'])
    
    #启动游戏服务端进程
    def startGamePy (self,port,serverType,py):
        try:
            portStr = str(port)
            _startConf = {
                '_GAMEPORT_':portStr,
                '_SERVERTYPE_':serverType
            }
            self.openShell('game'+portStr, py , _startConf , port=port , serverType=serverType)
        except:
            pass

    #运行子进程
    def openShell (self,key,py,env=None,port=None,serverType=None):
        sysEnv = copy.deepcopy(os.environ)
        if env!=None:
            for k,v in env.items(): sysEnv[k] = v
        
        print 'openShell',key,py
        self.processDict[key] = {
            'key':key,
            'py':py,
            'env':env,
            'process':subprocess.Popen(['pypy' if ispypy else 'python',py],cwd=ROOT,env=sysEnv),
            'port':port,
            'serverType':serverType
        }
        
        #启动自检
        if (port!=None and port!=0) or (serverType!=None and serverType.find('timer')!=-1):
            self.processDict[key]['pingFunction'] = selfping.start(self,self.processDict[key])

    #将子进程pid记录到txt
    def savePid (self):
        pids = []
        for k,v in self.processDict.items():
            _pid = self.processDict[k]['process'].pid
            pids.append(str(_pid))
            
        pids.append(str(self.mainPid))
        
        open("pid.txt","w").write('|'.join(pids))
        
    #杀死进程 p = self.processDict["key"]
    def killProcess (self,p):
        try:
            if 'pingFunction' in p and p['pingFunction']!=None:
                p['pingFunction'].stop()
                
            pid = p['process'].pid
            if os.name == 'nt':
                os.system('taskkill /PID %s /T /F' % pid)
            else:
                p['process'].terminate()
                p['process'].kill()
                os.kill(pid,9)
        except:
            pass
    
    #杀掉所有进程
    def killAllProcess(self):
        for k in self.processDict:
            self.killProcess(self.processDict[k])
        return True

#主控服务器对外命令
class mainServer(tw.Protocol):
    def connectionMade(self):
        pass
    def dataReceived(self,msg):
        #print 'mainServer dataReceived',msg
        if msg == 'stopserver':
            svrMana.killAllProcess()
            os._exit(0)
        elif msg == "restart":
            print "killAllProcess"
            svrMana.killAllProcess()
            time.sleep(1)
            print "flush_all_memcached"
            mc.flush_all()
            print "svrMana.start"
            svrMana.start()
        elif msg == "reload":
            self.sendWebApi("system_reload")
        else:
            pass
    def connectionLost(self,reason):
        pass
    
    #通知web服务器,调用web服务器的api
    def sendWebApi(self,api,data=[]):
        for port in conf["gameSvr"]:
            _url = "http://127.0.0.1:" + str(port) + "?a={0}&d={1}".format(api,str(data))
            urllib2.urlopen(_url,timeout=10).read()
            
#启动服务器
if __name__=='__main__':
    log.startLogging(sys.stdout)
    f = tw.Factory()
    f.protocol = mainServer

    port = int(conf['mainSvr'])
    tw.reactor.listenTCP(port,f)
    svrMana = SvrMana()
    svrMana.mainPid = os.getpid()
    svrMana.start()
    
    mc = mem.memcache.Client(conf['MEMCACHE'],dead_retry=3)
    mc.flush_all()
    
    tw.reactor.run()