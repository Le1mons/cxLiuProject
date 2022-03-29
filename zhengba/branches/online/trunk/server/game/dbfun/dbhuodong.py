#!/usr/bin/python
#coding:utf-8

#活动db层
import g


#获取活动信息
def getHuodongInfo(where=None,*arg,**kwargs):
    _res = g.mdb.find("hdinfo",where,*arg,**kwargs)
    return _res

#增加活动信息
def addHuodongInfo(data):
    _res = g.mdb.insert("hdinfo",data)
    return _res

#设置活动信息
def setHuodongInfo(where,data):
    _res = g.mdb.update("hdinfo",where,data)
    return _res
    

#获取活动数据
def getHuodongData(where=None,*arg,**kwargs):
    _res = g.mdb.find("hddata",where,*arg,**kwargs)
    return _res

#增加活动数据
def addHuodongData(data):
    _res = g.mdb.insert("hddata",data)
    return _res

#设置活动数据
def setHuodongData(where,data):
    _res = g.mdb.update("hddata",where,data,upsert=True)
    return _res