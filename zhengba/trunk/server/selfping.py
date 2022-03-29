#!/usr/bin/python
#coding:utf-8
import lib.tw as tw
import urllib2,socket,os

#HTTP PING进程
class HttpPing:
    def __init__ (self,svrMana,process):
        print 'HttpPing __init__'
        self.errTimers = 0
        self.svrMana = svrMana
        self.running = True
        self.process = process
    
    def stop(self):
        self.running = False
        
    def start (self):
        if not self.running:return
        try:
            url = 'http://127.0.0.1:'+ str(self.process['port'])+'/?a=system_selfping&d=[]'
            req = urllib2.urlopen(url,timeout=10)
            html = req.read()
            req.close()
            
            if html.find('selfpingreturnok')==-1 :
                self.errTimers+=1
            else:
                self.errTimers = 0
        except:
            self.errTimers+=1
        
        if self.errTimers>3:
            #自杀重启
            print 'kill process @',self.process['port']
            self.svrMana.killProcess(self.process)
            self.svrMana.startGamePy(
                int(self.process['port']),
                self.process['serverType'],
                self.process['py']
            )
            self.svrMana.savePid()
        else:
            if self.running:
                #print 'http ping ',self.errTimers
                self.timer = tw.reactor.callLater(20,self.start)

#HTTP PING进程
class SocketPing:
    def __init__ (self,svrMana,process):
        print 'SocketPing __init__'
        self.errTimers = 0
        self.svrMana = svrMana
        self.running = True
        self.process = process
    
    def stop(self):
        self.running = False
        
    def start (self):
        if not self.running:return
        try:
            mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
            mysocket.connect(('127.0.0.1',self.process['port']))
            mysocket.send( chr(1) + chr(1)+ 'system_selfping'+chr(4) + '' + chr(2) )
            res = mysocket.recv(1024)
            mysocket.close()
            
            if res.find('selfpingreturnok')==-1 :
                self.errTimers+=1
            else:
                self.errTimers = 0
        except:
            self.errTimers+=1
        
        if self.errTimers>3:
            #自杀重启
            print 'kill process @',self.process['port']
            self.svrMana.killProcess(self.process)
            self.svrMana.startGamePy(
                int(self.process['port']),
                self.process['serverType'],
                self.process['py']
            )
            self.svrMana.savePid()
        else:
            if self.running:
                #print 'socket ping ',self.errTimers
                self.timer = tw.reactor.callLater(20,self.start)


# UnixSocketPing进程
class UnixSocketPing:
    def __init__(self, svrMana, process):
        print 'UnixSocketPing  __init__'
        self.errTimers = 0
        self.svrMana = svrMana
        self.running = True
        self.process = process

    def stop(self):
        self.running = False

    def start(self):
        if not self.running: return
        if os.name == 'nt': return

        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.connect("./UNIX_TIMER_PING.d")
            sock.settimeout(3)
            sock.send('ping')
            res = sock.recv(1024)
            sock.close()
            
            if res.find('selfpingreturnok') == -1:
                self.errTimers += 1
            else:
                self.errTimers = 0
        except:
            self.errTimers += 1

        if self.errTimers > 3:
            # 自杀重启
            print 'kill process @', self.process['port']
            self.svrMana.killProcess(self.process)
            self.svrMana.startGamePy(
                int(self.process['port']),
                self.process['serverType'],
                self.process['py']
            )
            self.svrMana.savePid()
        else:
            if self.running:
                # print 'socket ping ',self.errTimers
                self.timer = tw.reactor.callLater(20, self.start)

def start(svrMana,process):
    ping = None
    
    print 'selfping process',process
    if svrMana=='memcache':
        print 'memcache process',process
    elif process['serverType']=='gamesvr':
        ping = HttpPing(svrMana,process)
        tw.reactor.callLater(60,ping.start)
    elif process['serverType'] in ['socketSvr','fightsvr']:
        ping = SocketPing(svrMana,process)
        tw.reactor.callLater(60,ping.start)
    elif process['serverType']=='timer' or process['serverType']=='crosstimer':
        ping = UnixSocketPing(svrMana,process)
        tw.reactor.callLater(60,ping.start)
    return ping


if __name__=='__main__':
    pass
    '''
    start({
        'serverType':'gamesvr'
    })
    '''
