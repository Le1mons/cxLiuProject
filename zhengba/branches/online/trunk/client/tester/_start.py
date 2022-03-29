#!/usr/bin/python
#coding:utf-8

import subprocess
import time,os
import ctypes
import sys,os,shutil
import glob
import json

##控制台输出颜色
STD_INPUT_HANDLE = -10
STD_OUTPUT_HANDLE= -11
STD_ERROR_HANDLE = -12

FOREGROUND_BLACK = 0x0
FOREGROUND_BLUE = 0x01 # text color contains blue.
FOREGROUND_GREEN= 0x02 # text color contains green.
FOREGROUND_RED = 0x04 # text color contains red.
FOREGROUND_INTENSITY = 0x08 # text color is intensified.

BACKGROUND_BLUE = 0x10 # background color contains blue.
BACKGROUND_GREEN= 0x20 # background color contains green.
BACKGROUND_RED = 0x40 # background color contains red.
BACKGROUND_INTENSITY = 0x80 # background color is intensified.

class Color:
    ''' See http://msdn.microsoft.com/library/default.asp?url=/library/en-us/winprog/winprog/windows_api_reference.asp
    for information on Windows APIs. - www.sharejs.com'''
    std_out_handle = ctypes.windll.kernel32.GetStdHandle(STD_OUTPUT_HANDLE)

    def set_cmd_color(self, color, handle=std_out_handle):
        """(color) -> bit
        Example: set_cmd_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE | FOREGROUND_INTENSITY)
        """
        bool = ctypes.windll.kernel32.SetConsoleTextAttribute(handle, color)
        return bool

    def reset_color(self):
        self.set_cmd_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE)

    def print_red_text(self, print_text):
        self.set_cmd_color(FOREGROUND_RED | FOREGROUND_INTENSITY)
        print print_text
        self.reset_color()

    def print_green_text(self, print_text):
        self.set_cmd_color(FOREGROUND_GREEN | FOREGROUND_INTENSITY)
        print print_text
        self.reset_color()

    def print_blue_text(self, print_text):
        self.set_cmd_color(FOREGROUND_BLUE | FOREGROUND_INTENSITY)
        print print_text
        self.reset_color()

    def print_red_text_with_blue_bg(self, print_text):
        self.set_cmd_color(FOREGROUND_RED | FOREGROUND_INTENSITY| BACKGROUND_BLUE | BACKGROUND_INTENSITY)
        print print_text
        self.reset_color()

## 处理日志中的js报错，打印出报错行数附近的代码
def fixjserror (line):
    if line.find('[jscontent]')==-1:
        return line
    else:
        lineArr = line.split('[jserror]')
        lineArr = lineArr[1].split('[jscontent]')
        lineArr = lineArr[0].split('~||~')
        
        fileName = lineArr[0]
        lineno = int(lineArr[1])
        err = lineArr[2]

        if os.path.isfile(fileName):
            fobj = open(fileName,'r')
            startLine = lineno-8
            _line = startLine+1
            contents = []
            for linecont in fobj.readlines()[startLine:startLine+8*2]:
                contents.append( str(_line)+'. '+ linecont )
                _line+=1
            fobj.close()
            contents.append('===========================')

            jscontent = "\r".join(contents)
            line = line.replace('[jscontent]',"\r\n===========================\r\n"+jscontent);

        return line

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

def addfile(path):
    zipPath = path
    path = path.replace('//', '/')

    if path.endswith('.png'):
        #PNG图片则检查是否存在同名.pvr.ccz
        pvr = path.replace('.png','.pvr.ccz_')
        if os.path.isfile(pvr):
            return

    if path.endswith('.json'):
        #如果是JSON文件，则先看下csb目录下是否有同名文件
        csb = path.replace('../res','../csb').replace('.json','.csb')
        #print 'check csb=',csb
        if os.path.isfile(csb):
            #print 'has csb',csb
            path = csb
            zipPath = zipPath.replace('.json','.csb')
    elif path.endswith('.png'):
        #如果是PNG文件，则先看下csb目录下是否有同名文件
        csb = path.replace('../res','../csb').replace('.png','.pvr.ccz_')
        #print 'check csb=',csb
        if os.path.isfile(csb):
            #print 'has csb',csb
            path = csb
            zipPath = zipPath.replace('.png','.pvr.ccz_')
    else:
        csb = path.replace('../res','../csb')
        # os.path.isfile(csb):
            #path = csb
    
    souceFile = path
    copyTo = zipPath.replace('../','./')
    #print 'souceFile',souceFile
    #print 'copyTo',copyTo
    if not os.path.exists(os.path.dirname(copyTo)):
        os.makedirs(os.path.dirname(copyTo))

    shutil.copy(souceFile,  copyTo)

def bindjs ():
    print 'bind js...'

    #base下除common.js外的其他文件
    base = glob.glob(r'../srczip/base/*.js');
    sorted(base)
    flist = []
    for f in base:
        if f.find('common.js')!=-1:
            continue
        flist.append(f)
    
    flist.append('../srczip/_myApp.js')
    flist.append('../srczip/_lng.js')
    flist.append('../srczip/_conf.js')
    
    #ui下的所有文件
    uis = glob.glob(r'../srczip/ui/*.js');
    for f in uis:
        flist.append(f)
    
    #ui下的所有目录
    uis = glob.glob(r'../srczip/ui/*/*.js');
    for f in uis:
        flist.append(f)
    
    #srczip下的所有文件
    jss = glob.glob(r'../srczip/*.js');
    sorted(jss)
    for f in jss:
        if f.find('auto_appconfig.js')!=-1:continue
        if f.find('_myApp.js')!=-1:continue
        if f.find('_lng.js')!=-1:continue
        if f.find('_conf.js')!=-1:continue

        flist.append(f)
    
    flist.insert(0,'../srczip/base/common.js')
    flist.insert(0,'../srczip/auto_appconfig.js')

    contents = []
    for f in flist:
        file_object = open(f)
        all_the_text = file_object.read()
        file_object.close()
        contents.append(';'+all_the_text+';')
    
    contents = "\r\n".join(contents);
    contents = contents.replace('console.log','cc.log')

    file_object = open('../src/game.min.js', 'w')
    file_object.write(contents)
    file_object.close()


def fixResAndStart ():

    #删除jsc文件
    srcf = os.listdir('../src/')
    print 'del ../src/*.jsc'

    for f in srcf:
        if f.endswith('.jsc'):
            os.remove('../src/'+f)
    
    #复制res资源
    if os.path.exists('./res'):
        print 'del res/*'
        shutil.rmtree('./res')

    getAllFile('../res',None)
    index = 0
    print 'copy ../res'
    for path in fileListArr:
        addfile(path)
        index+=1
    
    startEXE()

def startEXE ():
    #合并js
    bindjs()
    #启动客户端
    p = subprocess.Popen('js-tests.exe', shell=False, stdout=subprocess.PIPE,stderr=subprocess.PIPE,)
    clr = Color()

    redKey = ['cocos2d: SpriteFrameCache: can not find','CSLoader::nodeWithFlatBuffersFile']
    farceRed = False

    while True:
        line = p.stdout.readline()
        if line:
            if line.find('~serverError~')!=-1:
                farceRed = True
            if line.find('//endServerError')!=-1:
                farceRed = False

            if line.find('[jserror]')!=-1:
                clr.print_red_text(fixjserror(line))
            elif farceRed==True:
                clr.print_red_text(line)
            else:
                red = False
                for k in redKey:
                    if line.find(k)!=-1:
                        red = True
                        clr.print_red_text(line)
                        break

                if red==False:
                    try:
                        print line
                    except:
                        print repr(line)

def resetSandbox (name):
    print 'resetSandbox...'
    #修改config.json
    file_object = open('config.json')
    all_the_text = file_object.read()
    file_object.close()

    j = json.loads(all_the_text)
    j['sandbox'] = name+"/"
    j['title'] = name
    
    file_object = open('config.json', 'w')
    file_object.write(json.dumps(j,ensure_ascii=False))
    file_object.close()
    
    #创建sandbox目录
    if not os.path.exists(j['sandbox']):
        os.makedirs(j['sandbox'])

    #清空consolelog
    consolelog = j['sandbox']+'consolelog.txt'
  
    if os.path.isfile(consolelog):
        file_object = open(consolelog)
        all_the_text = file_object.read()
        file_object.close()
        all_the_arr = all_the_text.split("\n")
        
        maxlen = 5000
        if len(all_the_arr)>maxlen:
            all_the_arr = all_the_arr[-maxlen:]
            cont = "\n".join(all_the_arr)
            
            file_object = open(consolelog, 'w')
            file_object.write(cont)
            file_object.close()
        
    

def start ():
    try:
        myname = os.path.splitext(os.path.basename(__file__))[0]
    except NameError:  # We are the main py2exe script, not a module
        myname = os.path.splitext(os.path.basename(sys.argv[0]))[0]

    print '1 复制资源并启动 [如果svn更新过需选择该项]\n2 直接启动\n\n请选择操作(默认为2)：'.decode('utf-8').encode('gbk')
    val = raw_input()

    resetSandbox(myname)
    if val=='1':
        fixResAndStart()
    elif val=='2' or val=='':
        startEXE()

start()