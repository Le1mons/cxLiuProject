#!/usr/bin/python
#coding:utf-8
'''
关闭服务器
'''

import lib.file,os
import config,socket
def stopsvr():
	#关闭游戏进程
	try:
		mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
		mysocket.connect(('127.0.0.1',config.CONFIG['mainSvr']))
		mysocket.send('stopserver')
		mysocket.close()
	except:	
		print 'stopsvr except'
		pid = lib.file.readFile('pid.txt')
		if pid=='':return
		
		pidArr = pid.split('|')
		for p in pidArr:
			if os.name == 'nt':
				os.system('taskkill /PID %s /T /F' % p)
			else:
				print 'kill',p
				os.kill(int(p),9)

if '__main__' == __name__:
	stopsvr()
