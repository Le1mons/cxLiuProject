#!/usr/bin/python
#coding:utf-8
'''
用memcache来实现的队列

@author：刺鸟
@email：4041990@qq.com
'''
class MemcacheQueue:

	def __init__ (self,mc,namePre=''):
		self.MAX = 100 #队列上限
		self.mc = mc #memcache对象
		self.namePre = str(namePre) #名字前缀
		self.myIndex = None #我的队列索引

	
	def getIndexKey (self):
		return 'python'+ self.namePre + 'QueueIndex'
	
	def getDataKey (self,index):
		return 'python'+ self.namePre + 'Queue'+ str(index)
	
	def getIndex (self):
		#获取下一个指针ID
		try:
			indexKey = self.getIndexKey()
			index = self.mc.get(indexKey)
			if index==None : index = 0
		except:
			index = 0
		return int(index)
	
	#获取最新的key
	def getListKey(self):
		_idx=self.getIndex()
		if _idx == 0:
			return []
		_sidx = _idx - 20
		if _sidx < 0:
			_sidx = 0
		
		_list = []
		for i in xrange(_sidx,_idx):
			_list.append(self.getDataKey(i))

		return _list
	
			
	def put(self,dataStr):
		#将dataStr放入队列，仅支持字符串
		try:
			index = self.getIndex()
			nextIndex = index + 1
			if nextIndex>=self.MAX : nextIndex = 0
			
			indexKey = self.getIndexKey()
			dataKey = self.getDataKey(index)
			puted = self.mc.set_multi({dataKey:str(dataStr),indexKey:str(nextIndex)})
		except:
			pass

	def out (self ):
		'''
		获取队列中新增的数据，返回：
		{"k":[key1,key2]:"q":{"key2":...,"key1":...}}
		按k的顺序，到q中读取数据处理即可
		注意：q中有可能不存在k指定的key，做逻辑处理时需要判断
		'''
		keys,q = [],{}
		try:
			nextIndex = self.getIndex()

			if self.myIndex==None:
				self.myIndex = nextIndex
				return {"k":[],"q":{}}
			
			#print 'queue.py self.myIndex',self.myIndex
			#print 'queue.py self.nextIndex',nextIndex

			if self.myIndex<nextIndex:
				for i in xrange(self.myIndex,nextIndex):
					keys.append(self.getDataKey(i))

			if self.myIndex>nextIndex:
				for i in xrange(self.myIndex,self.MAX):
					keys.append(self.getDataKey(i))
				for i in xrange(0,nextIndex):
					keys.append(self.getDataKey(i))
			self.myIndex = nextIndex
			if len(keys)>0 : q = self.mc.get_multi(keys)
		except:
			pass
		return {"k":keys,"q":q}