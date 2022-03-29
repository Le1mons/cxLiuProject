#coding:utf-8
'''
#=============================================================================
#     FileName: CsvConfig.py
#         Desc: csv配置文件解析类
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-02-09 10:35:08
#      History:
#=============================================================================
'''

import re,string
#unicodeType = type(u'测')

class CsvConfig():
	_conf={}

	csvfile=''

	def __init__(self,csvfile):
		self.init(csvfile)

	def init(self,csvfile):
		#csvfile=self._getfile(csvfile)
		self.csvfile=csvfile

		reader=open(csvfile,'r')
		head=reader.readline().strip()
		head=head.split(',')
		isHertical=False
		for d in head:
			if re.match(r'^-?\d+(\.\d+)?$',d):
				isHertical=True
				break;
		if isHertical:
			self._parseHertical(reader,head)
		elif 'id' in head:
			self._parseKeyVertical(reader,head)
		else:
			self._parseVertical(reader,head)
		reader.close()
	

	def uni(self,s):
		return s
		'''
		global unicodeType
		if type(s)!=type(1) and type(s)!=unicodeType:
			s = unicode(s,'utf-8')
		return s
		'''


	def _parseValue(self,val):
		f=val.strip()

		try:
			#尝试转换为int型
			f = string.atoi(f,10)
		except:
			#尝试转换为float型
			try:
				f = string.atof(f)
			except:
				pass

		'''
		if re.match(r'^-?\d+(\.\d+)?$', f):
			if f.find('.')>-1:
				f=float(f)
			else:
				f=int(f)
		
		
		else:
			try:
				#f = unicode(f,'utf-8')
				f=f.decode('gbk')
			except:
				f = f
		'''

		return f

	def _parseHertical(self,reader,head):
		'''解析横向配置的csv配置文件,即一行一个配置数据，若有多列，以最后一列为准'''

		self._conf={}
		self._parseKV(head)

		data=reader.readline()
		while data:
			rec=data.strip().split(',')
			self._parseKV(rec)
			data=reader.readline()

	def _parseKV(self,rec):
		k = rec[0]
		if k=='':
			return
		f=None
		for v in rec:
			if v!=k:
				f=v
				break
		self._conf[k]=self._parseValue(f)
		
	def _parseVertical(self,reader,head):
		'''解析纵向配置的csv文件，即类似数据表形式的csv'''

		conf={}
		for  k in head:
			conf[k]=[]
			
		fieldindex=dict([(i,v)  for i,v in enumerate(head,0)])

		data=reader.readline()
		while data:
			data=data.strip()
			rec=data.split(',')
			if len(rec)>=len(data):
				data=reader.readline()
				continue;

			for i,f in enumerate(rec,0):
				k = fieldindex[i]
				f=self._parseValue(f)
				conf[k].append(f)

			data=reader.readline()

		self._conf=conf
		
	def _parseKeyVertical(self,reader,head):
		'''解析纵向配置且有“id”字段的csv文件，即类似数据表形式的csv'''

		conf={}
		keyindex=''
		fieldindex=dict([(i,v)  for i,v in enumerate(head,0)])
		for i,v in fieldindex.items():
			if v=='id':
				keyindex=i
				break
		#for  k in head:
		#	if k=='id':
		#		conf[k]=[]
		#	else:
		#		conf[k]={}
	
		data=reader.readline()
		while data:
			data=data.strip()
			rec=data.split(',')
			if len(rec)>=len(data):
				data=reader.readline()
				continue
			key=self._parseValue(rec[keyindex])
			for i,f in enumerate(rec,0):
				k = fieldindex[i]
				if k[:1]=='*':continue # *号表示不需要服务端载入
				f=self._parseValue(f)
				if not key in conf:conf[key]={}
				conf[key][k] = f

				#if i==keyindex:
				#	conf[k].append(f)
				#else:
				#	conf[k][key]=f
			data=reader.readline()
		self._conf=conf

	#def _getfile(self,csvfile):
	#	if csvfile[1:2]==':':
	#		return csvfile

	#	if __name__=='__main__':
	#		rpath=os.path.abspath('../../config_csv/'+csvfile)
	#	return rpath

	

	def get(self,field):
		return self[field]

	def __getitem__(self,field):
		if not field in self._conf:
			return None
		else:
			return self._conf[field]

if __name__=='__main__':
	configer=CsvConfig('../csv/itemcon.csv')
	#print configer.get('勇闯江湖匣_紫')
	print configer._conf

	

	#print aa

	#print aa[10].keys().index(1000)
	#
	#print max(aa)

	#print aa[10].keys()[1]
	

	#configer=CsvConfig('F:/phproot/jx/program/server/csv/bb.csv')
	#print configer.BB


	#configer=CsvConfig('d:/sgsvn/doc/config_csv/general.csv')
	#print '田丰',len(configer.lead)
	
	#configer=CsvConfig('d:/sgsvn/doc/config_csv/grainfield.csv')
	#print 'lv',configer.lv[1]

	#configer=CsvConfig('appconf.csv')
	#print 'grainfield_num_max',configer.grainfield_num_max

