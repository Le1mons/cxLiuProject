#!/usr/bin/python
#coding:utf-8

import g,os,time

'''
系统接口 - 改变时间
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    

def doproc(conn,data):
    _res = {"s":1}
    times = data[0]
    ttime = time.localtime(times)
    dat="date %u-%02u-%02u"%(ttime.tm_year,ttime.tm_mon,ttime.tm_mday)
    tm="time %02u:%02u:%02u"%(ttime.tm_hour,ttime.tm_min,ttime.tm_sec)
    os.system(dat)
    os.system(tm)
    
    return (_res)