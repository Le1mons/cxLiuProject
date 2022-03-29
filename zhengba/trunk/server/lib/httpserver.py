#!/usr/bin/python
#coding:utf-8
'''
基于http的服务器封装

@author：刺鸟
@email：4041990@qq.com
'''
import posixpath,urllib
import sys
ispypy = (sys.version.find('PyPy')!=-1)

class HTTPSERVER:
	def __init__ (self):
		pass
	
	#根据请求的内容，判断是否为HTTP请求
	def isHttpReq (self,msg):
		if msg.find('HTTP/')!=-1 and msg.find('Host:')!=-1 and (msg.find('GET')!=-1 or msg.find('POST')!=-1):
			return True
		return False
	
	#解析HTTP头
	def parseHead (self,requestline):
		requestline = requestline.rstrip('\r\n')
		body = ""
		header = requestline

		if requestline.find("\r\n\r\n")!=-1:
			header,body = requestline.split("\r\n\r\n",1)
		
		headerArr = header.split('\r\n')
		words = headerArr[0].split()
		
		version = '0'
		command = words[0]
		path = words[1]
		if len(words)>=3:
			version = words[2]
			base_version_number = version.split('/', 1)[1]
			version_number = base_version_number.split(".")
		
		headDict={}
		for h in headerArr:
			if h.find(':')>-1:
				hArr = h.split(':')
				headDict[hArr[0].strip()] = hArr[1].strip()
		
		get = self.translateRequest(path)
		post={}
		if  body !="":
			post = self.translateRequest('?'+body)

		res = {"command":command,"header":headDict,"path":path,"version":version_number,"get":get,"post":post,"request":dict(get, **post)}
		return res
	
	#解析请求信息
	def translateRequest(self, req):
		data={}
		if req.find('?')==-1 : return data
		req = req.split('?',1)[1]
		if req.find('#')!=-1 : req = req.split('#',1)[0]
		if req.find('&')!=-1 :
			req = req.split('&')
		else:
			d = []
			d.append(req)
			req = d
		
		for kv in req:
			_d = kv.split('=')
			data[_d[0]] = urllib.unquote(_d[1])
		return data
	
	#格式化HTTP数据
	def response (self,msgstr,ifgzip=False,ver='1.1'):

		if ifgzip:
			buf=StringIO.StringIO()
			f=gzip.GzipFile(mode="wb", fileobj=buf)
			if ispypy:
				f.write(msgstr.encode("utf-8"))
			else:
				f.write(msgstr)
			f.close()
			msg = buf.getvalue()
		else:
			msg = msgstr
		
		html="HTTP/"+ ver +" 200 OK\r\n"
		html+="Content-Type: text/html; charset=utf-8\r\n"
		if ifgzip: html+="Content-encoding: gzip\r\n"
		html+="Access-Control-Allow-Origin:*\r\n"
		html+="Content-length:" + str(len(msg)) + "\r\n\r\n"
		html += str(msg)
		return html

import StringIO,gzip
httpServer = HTTPSERVER()

if __name__=='__main__':
	requestline = 'GET /index.php?data=xxxxx&asd=dsad HTTP/1.1\r\nHost: 10.0.0.34:9999\r\nConnection: keep-alive\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\nUser-Agent: Mozilla/5.0 (Windows NT 5.2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17\r\nAccept-Encoding: gzip,deflate,sdch\r\nAccept-Language: zh-CN,zh;q=0.8\r\nAccept-Charset: GBK,utf-8;q=0.7,*;q=0.3\r\nCookie: __utma=224829978.2057457267.1359426513.1373183866.1373201376.47; __utmz=224829978.1359426513.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)\r\n\r\n'
	info = httpServer.isHttpReq(requestline)

	html = httpServer.response('这是一个测试')
	print html