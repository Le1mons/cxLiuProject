#!/usr/bin/python
#coding:utf-8

import json,glob,os

'''
处理客户端armyattr
'''

_commoent = {    
}
def start():
    print "start process armyattr"
    files = glob.glob('clientjson/armyattr.json')
    _globalMap = {}
    for ele in files:
        print "process json:%s" % ele
        _raw = open(ele,"rb").read()
        _rr = json.loads(_raw,encoding='utf-8')
        _globalMap.update(_rr)
    
    _newMap = {}
    for k in _globalMap:
        if str(k).find("default")!=-1 or str(k).find("grow")!=-1:
            _newMap[k] = _globalMap[k]
            
    #_globalMap.update(_commoent)
    _output = json.dumps(_newMap,indent=4,ensure_ascii=False).encode('utf-8')
    _file = open("armyattr.json","w")
    _file.truncate()
    _file.write(_output)
    _file.close()
    print "process success..."
    
start()


