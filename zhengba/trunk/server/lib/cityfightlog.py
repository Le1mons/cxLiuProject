#!/usr/bin/python
#coding:utf-8
'''=================
CITYFIGHT Python服务端
编写人：唐凯
时间：2016-11-10
=================='''
#日志文件
import logging,os,time,traceback
class CITYFIGHTLOG:
    def __init__(self,logger,msgPre='',showPrint=True):
        self.fileHandlerName = ''
        self.fileHandler = None
        self.loggerName = logger
        self.showPrint = showPrint
        self.msgPre = msgPre
        self.logger = logging.getLogger(logger)
        self.logger.setLevel(logging.DEBUG)
        #self.formatter = logging.Formatter("\n\ntime:%(asctime)s \t nfile:%(filename)s \t fun:%(funcName)s \t lineno:%(lineno)d \nmessage:%(message)s")
        self.formatter = ''

        # 控制台
        '''ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        ch.setFormatter(self.formatter)
        self.logger.addHandler(ch)'''

        path = os.path.abspath(os.path.dirname(__file__)) + '/../log/'+self.loggerName+'/'
    
    def setfh(self,cid):
        fname = 'cityfight_'+str(cid)
        if fname!=self.fileHandlerName:
            #移除原来的句柄
            if self.fileHandler!=None : 
                self.logger.removeHandler(self.fileHandler)
            #设置日志文件保存位置
            
            path = os.path.abspath(os.path.dirname(__file__)) + '/../log/'+self.loggerName+'/'
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
        _msg = ''
        for v in msg:
            _data = v['date']
            del v['date']
            _msg = _msg + _data+ ':'+ str(v)+'\n'
            
        return _msg

        
    #封装方法
    def w(self,*msg):
        if self.showPrint:
            _msg=''
            for v in msg:
                _msg = _msg + ' '+ str(v)
            #print self.msgPre,_msg

    def debug(self,cid,msg):
        _info = self._fmtInfo(msg)
        try:
            self.setfh(cid)
            self.logger.debug(_info)
        except:
            print 'mylog debug:' + _info

    def info(self,cid,msg):
        _info = self._fmtInfo(msg)
        try:
            self.setfh(cid)
            self.logger.info(_info)
        except:
            print 'mylog info:' + _info

            
if __name__=='__main__':
    log = CITYFIGHTLOG('cityfightlog','fightServer',False)
    try:
        print 1/0
    except:
        log.debug(2,[111,777]) #使用系统自己的错误描述

    time.sleep(2)

    try:
        print 2/0
    except:
        log.error('搞错了，分母不能为0') #使用自己的错误描述

