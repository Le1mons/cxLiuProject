#!/usr/bin/python
#coding:utf-8
'''
twisted 公共类
@author
@email4041990@qq.com
'''

import os
if os.name=='nt':
	try:
		import twisted.internet.iocpreactor as iocpreactor
		iocpreactor.install()
	except:
		print "iocp error"
	pass
else:
	try:
		import twisted.internet.epollreactor as epollreactor
		epollreactor.install()
	except:
		print "epoll error"

from twisted.internet.protocol import Factory,Protocol
from twisted.internet import reactor,threads,defer
from twisted.internet.protocol import ClientFactory

if os.name=='nt':
    #开发机只开1个线程 以便发现阻塞点
    reactor.suggestThreadPoolSize(1)
else:
    reactor.suggestThreadPoolSize(100)