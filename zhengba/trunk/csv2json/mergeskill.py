#!/usr/bin/python
#coding:utf-8

import json,glob,os

def start():
    print "start merge all item"
    files = glob.glob('samejson/skill_*.json')
    _globalMap = {}
    for ele in files:
        print "process json:%s" % ele
        _raw = open(ele,"rb").read()
        _rr = json.loads(_raw,encoding='utf-8')
        _globalMap.update(_rr)
    
    _output = json.dumps(_globalMap,indent=4,ensure_ascii=False).encode('utf-8')
    _file = open("samejson/skill.json","w")
    _file.truncate()
    _file.write(_output)
    _file.close()
    print "process success..."
    
start()


