#!/usr/bin/python
#coding:utf-8

#公共字典
class Dict(dict):
	def __getattr__(self, name):
		if name in self:
			return self[name]
		else:
			return None
 
	def __setattr__(self, name, value):
		self[name] = value
	
	def __delattr__(self, name):
		if name in self:
			del self[name]

#格式字典配置
#支持 a.b 属性读写模式
class fmtConfig(dict):
	def __getitem__(self, name):
		value = dict.__getitem__(self, name)
		if isinstance(value, dict) and not isinstance(value, fmtConfig):
			value = fmtConfig(value)
		if isinstance(value, list):
			value = tuple(value)
		return value

	__getattr__ = __getitem__
	#__setattr__ = dict.__setitem__
	#__delattr__ = dict.__delitem__

	def __setattr__(self, name, value):
		raise TypeError('donot set config='+name)
	def __delattr__(self, name):
		raise TypeError('donot del config='+name)

#将嵌套的LIST转换为tuple
class List2tuple:
	def __init__ (self):
		self.keyDict=[]

	def _do (self,d,parent=[],deep=1):
		#记录所有需要转换为tuple的list的key
		import copy
		if isinstance(d, dict) or isinstance(d, list):
			if isinstance(d, dict):
				each = d.items()
			elif isinstance(d, list):
				each = enumerate(d)

			for k,v in each:
				if isinstance(v, dict) or isinstance(v, list) or isinstance(v, tuple):
					_parent = copy.deepcopy(parent)
					_parent.append(k)

					if isinstance(v, list):
						self.keyDict.append(copy.deepcopy(_parent))
					self._do(v,_parent,deep+1)
		
	def do (self,d):
		self._data = d;
		self._do(self._data)
		while len(self.keyDict)>0:
			keys = self.keyDict.pop()
			py = "self._data"
			for _key in keys:
				if type(_key)==type(u''):
					py += "['"+ _key +"']"
				if type(_key)==type(1):
					py += "["+ str(_key) +"]"
			exec  ((py+" = tuple("+ py +")"))
		return self._data

class GameConfig:
	def __init__ (self):
		self._cache = {}
	
	def _fixJsonName (self,name):
		if not name.endswith('.json'):
			name = name + '.json'
		return name
		
	def readFile (self,fileName):
		#读文件
		import os
		Root=os.getcwd().split('game')[0]
		if Root[-1] != '/' and Root[-2:] != '\\':
			Root += '/'

		#不try直接抛出错误
		f = open(Root+fileName, 'r')
		outStr=f.read()
		f.close()
		
		return outStr
	
	def readJson (self,fileName):
		#读JSON
		import json
		txt = self.readFile(fileName)
		#不try直接抛出错误
		_json = json.loads(txt)
		return _json
		
	def getConfig (self,fileName):
		#读配置并格式化
		fileName = self._fixJsonName(fileName)
		if not fileName in self._cache:
			_json = self.readJson(fileName)
			list2tuple = List2tuple()
			_data = list2tuple.do(_json)
			self._cache[fileName] = _data

		return fmtConfig(self._cache[fileName])
		
	def __getitem__(self, fileName):
		return self.getConfig(fileName)
	
	__getattr__ = __getitem__


if __name__=='__main__':
	#直接属性写法访问字典，不存在的key不报错，直接返回None
	d = Dict()
	d.a = 4
	d["b"] = 6
	print 'd.d=',d.d
	
	#配置
	import time
	GC = GameConfig()
	
	#读配置
	title = GC.story.chapter['1'].title
	print title
	title = "modify"
	print title
	print GC.story.chapter['1'].title

	#写||删除配置
	#GC.story.chapter['1'].title = "aaa"
	#con = GC.story.chapter['1']
	#del con.title
	
	#修改配置
	#skill = GC.story.chapter['1'].con['1'].skill
	#for i in skill:
	#	i[0] = 5
		
	#性能测试
	s = time.time()
	for i in xrange(50000):
		GC.story
	e = time.time()
	print e-s