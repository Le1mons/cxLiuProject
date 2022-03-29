#!/usr/bin/python
#encoding=utf-8

import sys,shutil
import os.path
#================================================
fileListArr=[]
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

getAllFile('./csb',None)
for path in fileListArr:
    if path.endswith('.csb'):
        jsonName = path.replace('./csb','./res').replace('.csb','.json')
        if os.path.exists(jsonName):
            os.remove(jsonName)
        shutil.move(path,path.replace('./csb','./res'))
    
    if path.endswith('.plist'):
        if os.path.exists(path):
            shutil.move(path,path.replace('./csb','./res'))
    
    if path.endswith('.pvr.czz'):
        png = path.replace('./csb','./res').replace('.pvr.czz','.png')
        if os.path.exists(png):
            os.remove(png)
        shutil.move(path,path.replace('./csb','./res'))