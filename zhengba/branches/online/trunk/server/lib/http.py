#!/usr/bin/python
#coding:utf-8
'''
http请求封装

@author：刺鸟
@email：4041990@qq.com
'''
import urllib,urllib2
from simplequeue import SimpleQueue

from twisted.internet import threads,reactor
reactor.suggestThreadPoolSize(500)

class HTTP:
	def __init__ (self,maxload=50):
		self.MAXLOAD = maxload
		self.loading = 0 #正在读取中的请求数
		self.queue = SimpleQueue() #如果达到请求上限则加入队列
	
	def addLoadNum(self):
		self.loading = self.loading + 1
	
	def delLoadNum(self):
		self.loading = self.loading - 1
		if self.queue.qsize()>0:
			d = self.queue.get()
			self.request(d['url'],d['data'],d['callBack'],d['argv'])

	#发起一个HTTP请求
	#如果data有数据，则采用POST方式，请求结束后，如错误，重新请求5次。若有callback则会回调
	#data采用以下格式：
	#data ={'body' : 'test short talk','via':'xxxx'}
	def request(self,url,data=None,callBack=None,argv={}):
		#print '读取中',self.loading
		if self.loading>=self.MAXLOAD:
			#print '++++++加入队列+++++++++'
			self.queue.put({"url":url,"data":data,"callBack":callBack,"argv":argv})
			return

		self.addLoadNum()
		threads.deferToThread(self.requestDo,url,data,5,callBack,argv)
	
	def requestDo (self,url,data,retryTimes,callBack,argv):
		try:
			if data==None:
				req = urllib2.urlopen(url,timeout=10)
			else:
				reqdata = urllib.urlencode(data)
				req = urllib2.urlopen(url,reqdata,timeout=10)
			
			def empty():
				pass

			self.delLoadNum()
			if type(callBack) == type(empty):
				callBack(req.read(),argv)
		except:
			print url,'request error,retry Times',retryTimes
			if retryTimes>0:
				retryTimes = retryTimes -1
				self.requestDo(url,data,retryTimes,callBack,argv)
			else:
				print url,'request error,retry Times over delit'
				self.delLoadNum()

http = HTTP(1)

if __name__=='__main__':
	
	#回调方法必须2个参数：s = 请求的结果 ，par=传入的自定义{}
	succ = 0
	def p (s,par):
		#print par,'读取完毕'
		#print s
		global succ
		succ = succ + 1
		print succ
	
	#aa = '\u523a\u9e1f'
	
	#aa=eval("u'"+aa +"'").encode('UTF-8')
	

	#aa = unicode(aa,'UTF-8')

	#print aa

	#import time
	for i in xrange(1,20):
		print i
		http.request('http://m.baidu.com/',{"a":1,"b":2},p,{"idx":i})

	reactor.run()
	