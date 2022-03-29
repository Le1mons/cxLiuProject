#!/usr/bin/python
#coding:utf-8
'''=================
WebGame Python服务端
编写人：唐凯
时间：2011-9-13
=================='''
#日志文件
import logging,os,time,traceback
class LOG:
	def __init__(self,logger,msgPre='',showPrint=True):
		self.fileHandlerName = ''
		self.fileHandler = None
		self.loggerName = logger
		self.showPrint = showPrint
		self.msgPre = msgPre
		self.logger = logging.getLogger(logger)
		self.logger.setLevel(logging.DEBUG)
		self.formatter = logging.Formatter("\n\ntime:%(asctime)s \t nfile:%(filename)s \t fun:%(funcName)s \t lineno:%(lineno)d \nmessage:%(message)s")

		# 控制台
		ch = logging.StreamHandler()
		ch.setLevel(logging.DEBUG)
		ch.setFormatter(self.formatter)
		self.logger.addHandler(ch)

		path = os.path.abspath(os.path.dirname(__file__)) + '/../log/'+self.loggerName+'/'
	
	def setfh(self):
		fname = time.strftime("%Y%m%d%H")
		if fname!=self.fileHandlerName:
			#移除原来的句柄
			if self.fileHandler!=None : 
				self.logger.removeHandler(self.fileHandler)
			#设置日志文件保存位置
			
			path = os.path.abspath(os.path.dirname(__file__)) + '/../log/'+self.loggerName+'/'
			print path
			if os.path.isdir(path) == False:
				os.makedirs(path)
			fh = logging.FileHandler(path+fname+'.log')
			fh.setLevel(logging.DEBUG)
			fh.setFormatter(self.formatter)
			self.logger.addHandler(fh)

			self.fileHandlerName = fname
			self.fileHandler = fh

	#格式化日志内容
	def _fmtInfo(self,msg):
		if len(msg)==0:
			msg = traceback.format_exc()
			return self.msgPre + ' '+ msg
		else:
			_tmp = [self.msgPre + ' '+ msg[0]]
			_tmp.append(traceback.format_exc())
			return '\nsysErrmsg:'.join(_tmp)
	#封装方法
	def w(self,*msg):
		if self.showPrint:
			_msg=''
			for v in msg:
				_msg = _msg + ' '+ str(v)
			print self.msgPre,_msg

	def debug(self,*msg):
		_info = self._fmtInfo(msg)
		try:
			self.setfh()
			self.logger.debug(_info)
		except:
			print 'mylog debug:' + _info
	def error(self,*msg):
		_info = self._fmtInfo(msg)
		try:
			self.setfh()
			self.logger.error(_info)
		except:
			print 'mylog error:' + _info
	def info(self,*msg):
		_info = self._fmtInfo(msg)
		try:
			self.setfh()
			self.logger.error(_info)
		except:
			print 'mylog info:' + _info
	def warning(self,*msg):
		_info = self._fmtInfo(msg)
		try:
			self.setfh()
			self.logger.error(_info)
		except:
			print 'mylog warning:' + _info	
			
if __name__=='__main__':
	log = LOG('gamelog','前缀')
	try:
		print 1/0
	except:
		log.error() #使用系统自己的错误描述

	time.sleep(2)

	try:
		print 2/0
	except:
		log.error('搞错了，分母不能为0') #使用自己的错误描述

