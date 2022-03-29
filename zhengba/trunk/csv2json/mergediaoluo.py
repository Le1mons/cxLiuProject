#!/usr/bin/python
#coding:utf-8

import json,glob,os

'''
合并所有diaoluo为一个json
'''

def start():
    print "start merge all diaoluo"
    files = glob.glob('json/diaoluo*.json')
    _globalMap = {}
    for ele in files:
        if str(ele).find("diaoluolv")!=-1:continue
        print "process json:%s" % ele
        _raw = open(ele,"rb").read()
        _rr = json.loads(_raw,encoding='utf-8')
        _globalMap.update(_rr)
    
    #_globalMap.update(_commoent)
    _output = json.dumps(_globalMap,indent=4,ensure_ascii=False).encode('utf-8')
    _file = open("diaoluo.json","w")
    _file.truncate()
    _file.write(_output)
    _file.close()
    print "process success..."
    
start()


