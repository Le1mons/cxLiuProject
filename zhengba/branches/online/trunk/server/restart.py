#!/usr/bin/python
#coding:utf-8
'''
关闭服务器
'''

import lib.file,os
import config,socket
def restartsvr():
	try:
		mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
		mysocket.connect(('127.0.0.1',config.CONFIG['mainSvr']))
		mysocket.send('restart')
		mysocket.close()
	except:	
		print 'restart except'
		

if '__main__' == __name__:
	restartsvr()
