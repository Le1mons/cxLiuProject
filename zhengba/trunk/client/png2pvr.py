#!/usr/bin/python
#encoding=utf-8

import sys,time,shutil,json,hashlib
import os.path,subprocess

pngConf = None
def getConfJSON ():
    global pngConf
    o = open('png2pvrconf.json')
    txt = o.read()
    o.close()
    pngConf = json.loads(txt)
getConfJSON()

#大文件的MD5值
def getFileMd5(filename):
    if not os.path.isfile(filename):
        return
    myhash = hashlib.md5()
    f = file(filename,'rb')
    while True:
        b = f.read(8096)
        if not b :
            break
        myhash.update(b)
    f.close()
    return myhash.hexdigest()


def png2pvrCMD (t,png):
    return r'engine\TexturePacker\bin\TexturePacker.exe "res/'+ png +'.png" --sheet "csb/'+ png +'.pvr.ccz" --data tmp/'+ png +'.plist --opt '+ t +' --allow-free-size --algorithm Basic --no-trim --dither-fs --shape-padding 0 --border-padding 0 --disable-rotation  --smart-update'

def replacePlist (png):
    plist = 'res/'+ png +'.plist'
    if not os.path.exists(plist):
        return

    o = open(plist)
    txt = o.read()
    o.close()

    txt = txt.replace('<string>'+ png +'.png</string>','<string>'+ png +'.pvr.ccz</string>')

    to = open('csb/'+ png +'.plist','w+')
    to.write(txt)
    to.close()
    print png,'plist replace overed'

def getPVRVersion ():
    vfile = 'csb/resversion.txt'
    if not os.path.exists(vfile):
        return {}
    else:
        o = open(vfile)
        txt = o.read()
        o.close()
        return json.loads(txt)

def setPVRVersion (data):
    vfile = 'csb/resversion.txt'
    o = open(vfile,'w+')
    txt = o.write(json.dumps(data, ensure_ascii=False))
    o.close()
    print 'setPVRVersion success!!'

version=None;
def png2pvr ():
    return
    global pngConf,version
    if(os.path.exists('tmp')): shutil.rmtree('tmp')
    
    version = getPVRVersion()
    for pvrtype,pnglist in pngConf.items():

        #在8888中自动添加res下所有具备同名plist和png的文件
        if pvrtype=='RGBA8888':
            resFiles = os.listdir('res')
            for f in resFiles:
                if f.endswith('.png') and os.path.isfile('./res/'+ f.replace('.png','.plist')):
                    pnglist.append( f.replace('.png','') )
         
        for png in pnglist:
            #info=os.stat('res/'+ png +".png")
            #fv = 'v'+ str(info.st_mtime)
            fv = getFileMd5('res/'+ png +".png")
            if not png in version or version[png]!=fv:
                version[png] = fv
                replacePlist(png)
                #os.system(png2pvrCMD(pvrtype,png))
                subprocess.Popen(png2pvrCMD(pvrtype,png))
            else:
                print 'skip',png

    checkPID()

def checkPID ():
    global version
    tppid = os.popen('tasklist').read().find('TexturePacker.exe')
    if tppid==-1:
        print 'all success!!'
        setPVRVersion(version)
        if(os.path.exists('tmp')): shutil.rmtree('tmp')
    else:
        time.sleep(1)
        checkPID()

if __name__=='__main__':
    png2pvr()
