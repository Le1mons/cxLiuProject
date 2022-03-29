#!/usr/bin/python
#coding:utf-8
'''
python实现的crontab

@author：刺鸟
@email：4041990@qq.com

f1 f2 f3 f4 f5

其中 f1 是表示分钟，f2 表示小时，f3 表示一个月份中的第几日，f4 表示月份，f5 表示一个星期中的第几天(0-6,0为星期天)。program 表示要执行的程式。
当 f1 为 * 时表示每分钟都要执行 program，f2 为 * 时表示每小时都要执行程式，其余类推
当 f1 为 a-b 时表示从第 a 分钟到第 b 分钟这段时间内要执行，f2 为 a-b 时表示从第 a 到第 b 小时都要执行，其余类推
当 f1 为 a, b, c,... 时表示第 a, b, c,... 分钟要执行，f2 为 a, b, c,... 时表示第 a, b, c...个小时要执行，其余类推

当 f1 为 */n 时表示每 n 分钟个时间间隔执行一次，f2 为 */n 表示每 n 小时个时间间隔执行一次

** 注意：不支持 /和,和- 混合写入同一个f值

aa = crontab.add("*/5 */3 4 5 *",aaa)
#5月4号的[0, 3, 6, 9, 12, 15, 18, 21]点[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]分执行aaa函数

bb = crontab.add("51 14 8,13 5 2",bbb)
#5月8号或5月13号，且是星期2， 14:51分执行bbb函数

cc = crontab.add("30-37 15 * * 2",ccc,{'a':'b'})
#星期2，15点30分（含）到15点37分（含），每一分钟执行一次ccc函数，参数为{'a':'b'}
'''
import time
from twisted.internet import threads,reactor
reactor.suggestThreadPoolSize(500)

class Crontab:
    def __init__ (self):
        '''
        timeCache将时间配置及callback按以下格式记录
        {"time":[[7,25], [4,5,6], [5], '*', '*'],"callback":def,"arg":{}}
        '''
        self.timeSCache = {}
        self.timeMCache = {}
        self.unixTime = int(time.time()) #时间戳
        self.lastFunTime = 0 #最后一次事件的时间
    
    def start (self):
        self.timer()
        reactor.run()

    def add (self,tid,timestr):
        #增加一个计划任务，返回该任务的编号
        
        if type(timestr) == type(1):
            self.timeSCache[tid] = int(timestr)
            return tid

        timeArr = timestr.split(' ')
        if len(timeArr)!=5:
            print '任务增加失败，时间配置必须为5项'
            return
        for i in xrange(0,len(timeArr)):
            if timeArr[i]!='*':
                if timeArr[i].find('-')!=-1:
                    tmp = timeArr[i].split('-')
                    timeArr[i] = range(int(tmp[0]),int(tmp[1])+1)
                elif timeArr[i].find('/')!=-1:
                    if not i in [0,1,2]:
                        print '只有分钟、小时、日期支持/语法'
                        return
                    minVal = [0,0,1]
                    maxVal = [60,24,31] 
                    tmp = timeArr[i].split('/')
                    timeArr[i] = range(int(minVal[i]),int(maxVal[i]),int(tmp[1]))
                else:
                    timeArr[i] = [int(n) for n in timeArr[i].split(',')]
        
        self.timeMCache[tid] = timeArr
        return tid
    
    def delTasks (self,tid):
        #删除一项任务，idx为任务编号
        if tid in self.timeSCache:
            del self.timeSCache[tid]
        if tid in self.timeMCache:
            del self.timeMCache[tid]

    def checkMFun(self,now):
        #开始扫描有无任务需要执行
        #print '开始检测任务列表'
        if len(self.timeMCache)==0:return
        
        for tid,timestr in self.timeMCache.items():
            if type(timestr)==type(1):
                pass
            elif self.match(timestr,now):
                self.emit(tid)
    
    def checkSFun(self,now):
        #开始扫描有无任务需要执行
        #print '开始检测任务列表'
        if len(self.timeSCache)==0:return
        
        for tid,timestr in self.timeSCache.items():
            if type(timestr)==type(1) and int(timestr)==int(now):
                self.emit(tid)
                del self.timeSCache[tid]

    def match(self,conf,now):
        #判断时间是否匹配
        try:
            matchVal = [
                int(time.strftime("%M",now)), #minute
                int(time.strftime("%H",now)), #hour
                int(time.strftime("%d",now)), #day
                int(time.strftime("%m",now)), #month
                int(time.strftime("%w",now)) #week
            ]
            matchTimes = 0 #匹配了多少项
            for i in xrange(0,len(conf)):
                if conf[i]=='*':
                    matchTimes = matchTimes + 1
                elif matchVal[i] in conf[i]:
                    matchTimes = matchTimes + 1
            return (matchTimes==5)
        except:
            print '时间配置错误',conf
            return False

    def timer (self):
        #时间差，如果被跳过了一定范围内的秒数，则修正
        timeDiff = int(time.time()) - self.unixTime
        checkTime = [int(self.unixTime)]
        
        if timeDiff>1 and timeDiff<60:
            #2~60秒内的误差，有可能是服务器时间自动对时引起的
            for i in xrange(0,timeDiff):
                self.unixTime+=1
                checkTime.append(int(self.unixTime))

        self.unixTime = int(time.time())

        for t in checkTime:
            if self.lastFunTime==t : continue
            now = time.localtime(t)
            secend = int(time.strftime("%S",now))
            self.checkSFun(t) #检测秒事件
            if secend==0: self.checkMFun(now) #检测分事件 eg:"*/5 */3 4 5 *"
            self.lastFunTime = t
        
        reactor.callLater(1,self.timer)


if __name__=='__main__':

    crontab = Crontab()
    
    def aaa (a):
        print 'runing aaa',a
        time.sleep(3)
        print 'aaa over'
    def bbb (a):
        print 'runing bbb',a
        time.sleep(3)
        print 'bbb over'
    def ccc (a):
        print 'runing ccc',a
        time.sleep(3)
        print 'ccc over'

    aa = crontab.add("*/5 */3 4 5 *",aaa)
    #5月4号的[0, 3, 6, 9, 12, 15, 18, 21]点[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]分执行aaa函数

    bb = crontab.add("51 14 8,13 5 2",bbb)
    #5月8号或5月13号，且是星期2， 14:51分执行bbb函数
    
    cc = crontab.add("30-37 15 * * 2",ccc,{'a':'b'})
    #星期2，15点30分到15点37分，每一分钟执行一次ccc函数
    
    print crontab.timeCache
    #print aa
    #print bb

    crontab.start()

    #print time.strftime("%w",int(time.time()))

