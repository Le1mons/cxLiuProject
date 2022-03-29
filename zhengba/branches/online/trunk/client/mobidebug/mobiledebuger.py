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
        zipPath = path
        path = path.replace('//', '/')
        
        print 'path',path

        if path.endswith('.png'):
            #PNG图片则检查是否存在同名.pvr.ccz
            pvr = path.replace('.png','.pvr.ccz_')
            if os.path.isfile(pvr):
                return

        if path.endswith('.json'):
            #如果是JSON文件，则先看下csb目录下是否有同名文件
            csb = path.replace('../res/','../csb/').replace('.json','.csb')
            print 'check csb=',csb
            if os.path.isfile(csb):
                print 'has csb',csb
                path = csb
                zipPath = zipPath.replace('.json','.csb')
        elif path.endswith('.png'):
            #如果是PNG文件，则先看下csb目录下是否有同名文件
            csb = path.replace('../res/','../csb/').replace('.png','.pvr.ccz_')
            print 'check pvr=',csb
            if os.path.isfile(csb):
                print 'has pvr',csb
                path = csb
                zipPath = zipPath.replace('.png','.pvr.ccz_')
        else:
            csb = path.replace('../res/','../csb/')
            print 'check csb=',csb
            #if os.path.isfile(csb):
                #print 'has csb',csb
                #path = csb

        if not arcname:
            if zipPath.startswith(self.basedir):
                arcname = zipPath[len(self.basedir):]
            else:
                arcname = ''
        
        arcname = arcname.replace('../res/', '')
        arcname = arcname.replace('../src/', 'src/')

        print 'arcname',arcname
        print '-------'
        if(arcname=='../' or arcname=='./' or arcname=='.'):return

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
            
def create(zfile, dirs, files):
    z = ZFile(zfile, 'w')
    z.addfiles(dirs)
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
        #self.set_debuglevel(0)
        if(self.res[0]!=1):
            print >>sys.stderr, self.res[1]
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


fileListArr=[]
allDirs = []

def getAllFile(path,ext):
    global fileListArr
    blackFile = ['Thumbs.db','jsc.bat','proConfig.php','index.php','topvr.bat','upload.py','cocos2d_h5.js','game.html','build.xml']
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

#ftp = MyFTP()
#ftp.ConnectFTP('10.0.0.107',21,'legu35','legu35')

sendType = "all"

#import png2pvr
#png2pvr.png2pvr()


#====
#ZIP后传全部文件
#'''
print 'get file list...'
#getAllFile('./src','.jsc')

getAllFile('../src','.js')
getAllFile('../res',None)

#print fileListArr



for f in fileListArr:
    dirstr =  os.path.dirname(f)
    dirs = dirstr.split('/')
    
    _v = []
    for d in dirs:
        _v.append(d)
        _vstr = '/'.join(_v)
        if _vstr!="":
            _vstr += "/"
            
        if _vstr!="" and _vstr not in allDirs:
            allDirs.append(_vstr)
           
#print allDirs

print 'start zip'
create('data.zip',allDirs,fileListArr)
print 'zip over'

ftp = MyFTP()
ftp.ConnectFTP('10.0.0.5',21,'hupdate','hupdate')
ftp.setRoot('/')
ftp.uploads(['data.zip'])

