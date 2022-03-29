#!/usr/bin/python
#coding:utf-8
'''
简单无锁队列，先进先出

@author：刺鸟
@email：4041990@qq.com
'''
import heapq
class SimpleQueue:
	def __init__(self):
		self.queue = []
	
	#是否为空
	def empty (self):
		return len(self.queue)==0
	
	#长度
	def qsize (self):
		return len(self.queue)
	
	#放入
	def put (self,item):
		heapq.heappush(self.queue,item)
	
	#取出
	def get (self):
		return heapq.heappop(self.queue)
		
if __name__=='__main__':
	queue = SimpleQueue()

	for i in xrange(1,200):
		queue.put(i)
	while queue.empty()==False:
		print queue.get(),queue.qsize()
		

