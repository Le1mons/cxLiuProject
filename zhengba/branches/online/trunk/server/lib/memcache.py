#!/usr/bin/python
#coding:utf-8
'''
memcache封装
在windows下采用winmemcache.py
在linux上，采用性能更优的pylibmc

@author：刺鸟
@email：4041990@qq.com
'''

import os
if os.name=='nt':
	try:
		import winmemcache as memcache
	except:
		print 'winmemcache error'
else:
	try:
		#import pylibmc as memcache
		import winmemcache as memcache
	except:
		print 'pylibmc error'

if __name__=='__main__':
	try:
		#mc = memcache.Client(['10.0.0.5:11104'],dead_retry=3)
		pass
	except:
		print "can't connect to memcache"
	
	
	import time
	_memcache = None
	def mc():
		global _memcache
		if _memcache!=None : return _memcache

		if os.name=='nt':
			_memcache = memcache.Client(['10.0.0.5:11104'],dead_retry=3) #出错后3S重连
		else:
			#_memcache =  memcache.Client(config.MEMCACHE)
			_memcache = memcache.Client(['10.0.0.5:11104'],dead_retry=3) #出错后3S重连
		return _memcache

	
	for i in range(1,500):
		cc = mc()
		cc.set('a','b'+str(i))
		print cc.get('a')
		time.sleep(1)
	
	#me = Player('zbmusic')
	#me.move(500,300)
	#me.show()
	
	#mc.set('mezbmusic',me)

	#p = mc.get('mezbmusic')
	#p.move(600,700)
	#mc.delete('mezbmusic')