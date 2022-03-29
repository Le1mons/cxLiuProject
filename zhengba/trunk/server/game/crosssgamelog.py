#!/usr/bin/python
#coding:utf-8

'''
#跨服游戏日志
主要用于收集某些诡异bug的日志，该日志功能切勿滥用，会影响性能
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
import inspect

def addLog(logType,data=[],*a,**k):
    try:
        v = repr(inspect.stack())
        _data = {
            'logType':logType,
            'data':data,
            'stack':v
        }
        g.crossDB.insert('crossgamelog', _data)
    except:
        pass

if __name__=="__main__":
    pass