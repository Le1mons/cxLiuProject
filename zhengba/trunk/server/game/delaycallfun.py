#!/usr/bin/python
#coding:utf-8

import g
CALL_LIST = {}

def add(uniKey,delayTime,callfun,*a,**k):
    global CALL_LIST
    if uniKey in CALL_LIST:
        try:
            CALL_LIST[uniKey].cancel()
        except:
            pass
        del CALL_LIST[uniKey]
    
    def doFun(*a,**k):
        try:
            callfun(*a,**k)
        except:
            pass
        
        if uniKey in CALL_LIST:
            del CALL_LIST[uniKey]
        
    CALL_LIST[uniKey] = g.tw.reactor.callLater(delayTime,callfun,*a,**k)

if __name__ == "__main__":
   
    def test(a,b,e=3,f=4):
        print 'test',a,b,e,f
    
    add('aaa',1,test,*[1,2],**{"f":5})
    g.tw.reactor.run()
    
    