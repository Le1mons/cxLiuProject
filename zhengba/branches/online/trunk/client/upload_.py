#!/usr/bin/python
#encoding=utf-8

from ftplib import FTP
import sys
import zipfile
import os.path

# coding:cp936  
# Zfile.py  
# xxteach.com  
import zipfile
import os.path
import os

class ZFile(object):
	def __init__(self, filename, mode='r', basedir=''):
		self.filename = filename
		self.mode = mode
		if self.mode in ('w', 'a'):
			self.zfile = zipfile.ZipFile(filename, self.mode, compression=zipfile.ZIP_DEFLATED)
		else:
			self.zfile = zipfile.ZipFile(filename, self.mode)
		self.basedir = basedir
		if not self.basedir:
			self.basedir = os.path.dirname(filename)
		  
	def addfile(self, path, arcname=None):
		path = path.replace('//', '/')
		if not arcname:
			if path.startswith(self.basedir):
				arcname = path[len(self.basedir):]
			else:
				arcname = ''
		self.zfile.write(path, arcname)
			  
	def addfiles(self, paths):
		for path in paths:
			if isinstance(path, tuple):
				self.addfile(*path)
			else:
				self.addfile(path)
			  
	def close(self):
		self.zfile.close()
		  
	def extract_to(self, path):
		for p in self.zfile.namelist():
			self.extract(p, path)
			  
	def extract(self, filename, path):
		if not filename.endswith('/'):
			f = os.path.join(path, filename)
			dir = os.path.dirname(f)
			if not os.path.exists(dir):
				os.makedirs(dir)
			file(f, 'wb').write(self.zfile.read(filename))
			
def create(zfile, files):
	z = ZFile(zfile, 'w')
	z.addfiles(files)
	z.close()

def extract(zfile, path):
	z = ZFile(zfile)
	z.extract_to(path)
	z.close()

class MyFTP(FTP):
	def __init__(self):
		print 'FTP init'
	def ConnectFTP(self,remoteip,remoteport,loginname,loginpassword):
		print 'Connecting ftp://'+str(loginname)+':'+str(loginpassword)+'@'+remoteip+':'+str(remoteport)
		try:
			self.connect(remoteip,remoteport,600)
			print 'success'
		except Exception, e:
			print >> sys.stderr, "conncet failed1 - %s" % e
			self.res =  (0,'conncet failed')
		else:
			try:
				self.login(loginname,loginpassword)
				print('login success')
			except Exception, e:
				print >>sys.stderr, 'login failed - %s' % e
				self.res =  (0,'login failed')
			else:
				self.res =  (1,self)
	
	def setRoot (self,root):
		self.root = root
	
	def goRoot (self):
		self.cwd(self.root)
		
	def uploads (self,fileList):
		print 'uploads', fileList
		self.set_debuglevel(0)
		if(self.res[0]!=1):
			print >>sys.stderr, res[1]
			sys.exit()
		
		#创建所有目录
		for f in fileList:
			self.goRoot()
			remote = self.splitpath(f)
			serverRemote = self.splitpath(f)

			serverF = f
			#if f.find('srcmin')!=-1:
				#serverF=f.replace('srcmin','')
				#serverRemote = self.splitpath(serverF)
			
			self.mkdirs(serverRemote[0])
			self.goRoot()
			
			self.cwd(serverRemote[0])
			print 'upload',f
			self.storbinary('STOR %s' %remote[1], open(f, 'rb'))
		
		#self.quit()
		print 'ok'
		#sys.exit()
	
	def mkdirs (self,dirs):
		arr = dirs.split('/')
		if len(arr)==1:return
		
		for d in arr:
			if d=='':continue
			try:
				self.mkd(d)
			except:
				pass
			self.cwd(d)

	def splitpath(self,remotepath):
		position=remotepath.rfind('/')
		return (remotepath[:position+1],remotepath[position+1:])


fileListArr=['./project.json','./main.js']
def getAllFile(path,ext):
	global fileListArr
	blackFile = ['Thumbs.db','jsc.bat','proConfig.php','index.php','upload.py','cocos2d_h5.js','game.html','build.xml']
	blackdir = ['.svn','engine','reszip','csv','bindings']
	if os.path.exists('srcmin'):
		blackdir.append('src/')
		blackdir.append('src\\')
	
	if os.path.isfile(path):
		path = path.replace('\\','/')

		if ext!=None and ext!=path[path.rfind('.'):]:
			return

		for f in blackFile:
			if path.find(f)!=-1:return
		fileListArr.append(path)
	elif os.path.isdir(path):
		for item in os.listdir(path):
			for f in blackdir:
				if path.find(f)!=-1:return

			itemsrc = os.path.join(path, item)
			getAllFile(itemsrc,ext)

#================================================
#设置项目的目录
project = 'king39'
#project = 'xiyou225'

ftp = MyFTP()
ftp.ConnectFTP('10.0.0.107',21,'legu35','legu35')

sendType = "all"

if sendType!="all":
	#====
	#按需要传部分文件
	#'''
	getAllFile('./srcmin','.jsc')
	#getAllFile('./res/json','.json')
	ftp.setRoot('/'+ project +'/Resources/')
	ftp.uploads(fileListArr)

	ftp.setRoot('/'+ project +'/proj.android/assets/')
	ftp.uploads(fileListArr)
	#'''
	#====
else:
	#====
	#ZIP后传全部文件
	#'''
	print 'get file list...'
	getAllFile('./src','.js')
	getAllFile('./res',None)
	print 'start zip'
	create('data.zip',fileListArr)
	print 'zip over'
	#ftp.setRoot('/'+ project +'/')
	#ftp.uploads(['data.zip'])

	ftp.setRoot('/'+ project +'/frameworks/runtime-src/proj.android/assets/')
	ftp.uploads(['data.zip'])
	#'''
	#====
