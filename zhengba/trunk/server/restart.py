#!/usr/bin/python
#coding:utf-8
'''
关闭服务器
'''

import os,time,sys,time

def restartsvr():
    try:
        print 'kill1'
        os.system("python ./stopserver.py")
        time.sleep(10)
        print 'kill12'
        os.system("python ./stopserver.py")
        time.sleep(10)
        print 'start....'
        strTime = time.strftime("%Y%m%d_%H%M%S", time.localtime(time.time()) )
        os.system("nohup python start.py "+ os.getcwd() + " " + strTime +" > s.log  2>&1 &")
        print 'end'
    except:
        print 'restart except'


if '__main__' == __name__:
	restartsvr()
