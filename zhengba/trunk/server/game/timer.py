#!/usr/bin/python
#coding:utf-8

import g
#定时器

GLOBAL_TIMER_CHKIDX = 0
def setTimeout (s,fun,*arg,**karg):
    global GLOBAL_TIMER_CHKIDX
    GLOBAL_TIMER_CHKIDX += 1
    karg['timerid'] = g.C.getUniqCode() + str(GLOBAL_TIMER_CHKIDX)
    g.m.mymq.setTimer(s,fun,*arg,**karg)
    return karg['timerid']

def runat (s,fun, *arg,**karg):
    global GLOBAL_TIMER_CHKIDX
    GLOBAL_TIMER_CHKIDX += 1
    karg['timerid'] = g.C.getUniqCode() + str(GLOBAL_TIMER_CHKIDX)
    g.m.mymq.runat(s,fun,*arg,**karg)
    return karg['timerid']

def clearTimer (tid):
    g.m.mymq.clearTimer(tid)

if __name__=='__main__':
    #固定时间戳的定时器，会在timeout时被清空，多用于动态定时器
    setTimeout(5,"testaaa")
    setTimeout(10,"testbbb",1,2,3,k='k1',timerid='abcdefg')
    runat( int(time.time())+15,"testccc")

    #字符串的定时器会在每次系统启动时被清空，多用于已知固有的定时器
    runat("*/5 */3 4 5 *","testddd")   
    clearTimer('abcdefg')
