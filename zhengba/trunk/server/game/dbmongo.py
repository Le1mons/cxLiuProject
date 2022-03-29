#!/usr/bin/python
#coding:utf-8
#import lib.mytxmongo as txmongo
#from lib.mytxmongo import filter as qf
#import re
#from lib.mytxmongo.collection import *
from bson.objectid import ObjectId
from bson.int64 import Int64
import pymongo, random

#mongo数据库db
class MongoDB(object):
    #实例化数据库
    def __init__(self,config):
        self.host = config['host']
        self.port = config['port']
        self.poolsize = config['poolsize']
        self.dbname = config['dbname']
        self.authDB = "admin"
        if "authdb" in config:
            self.authDB = config["authdb"]
            
        if "dbuser" in config:
            self.dbuser = config["dbuser"]

        if "dbpwd" in config:
            self.dbpwd = config["dbpwd"]

        self.__getConn()
        self.select = self.find
        self.select1 = self.find1
        
    #链接数据库
    def __getConn(self,**kwargs):
        if hasattr(self,"mongodb"):
            return self.mongodb
        
        self.client = pymongo.MongoClient(host=self.host,port=self.port,maxPoolSize=self.poolsize)
        #self.client = txmongo.MongoConnection(host=self.host,port=self.port,pool_size=self.poolsize)
        self.mongodb = self.client.get_database(self.dbname)
        if hasattr(self,"dbuser") and hasattr(self,"dbpwd"):
            self.client.get_database(self.authDB).authenticate(self.dbuser,self.dbpwd)
            #self.client.authenticate(self.authDB,self.dbuser,self.dbpwd)
            
        return self.mongodb
    
    #转化为objectId数据类型
    def toObjectId(self,oid):
        return ObjectId(oid)
    
    #转化为int64数据类型
    def toInt64(self,num):
        return Int64(num)
    
    #插入数据
    #@defer.inlineCallbacks
    def insert(self,tb,*arg,**key):
        _res = self.mongodb[tb].insert(*arg,**key)
        return _res

    #同时修改修改数据
    #@defer.inlineCallbacks
    def update(self,tb,where,data,**key):
        ndata = data
        if (''.join(data.keys()).find('$')) == -1:
            ndata = {}
            ndata['$set'] = data

        _res = self.mongodb[tb].update(where,ndata,multi=True,**key)
        return _res
    
    #查询数据
    #@defer.inlineCallbacks
    def find1(self,tb,*arg,**key):
        if 'where' in key:
            key['filter'] = key['where']
            del key['where']
        
        #if "sort" in key:
            #_sordList = qf.sort(key["sort"])
            #if "filter" not in key:
                #key["filter"] = _sordList
            #else:
                #key["filter"].update(_sordList)
            
            #del key["sort"]
                
        
        if "fields" in key and type(key["fields"])==list:
            _fmap = {}
            for ele in key["fields"]:
                if ele!="_id":
                    _fmap[ele] = 1
                else:
                    _fmap[ele] = 0
            
            key["fields"] = _fmap

        if "fields" in key:
            key["projection"] = key["fields"]
            del key["fields"]        

        _res = self.mongodb[tb].find_one(*arg,**key)
        #if "_id" in _res:
            #_res["_id"] = str(_res["_id"])

        return _res
        
    #查询数据集
    #@defer.inlineCallbacks
    def find(self,tb,*arg,**key):
        if 'where' in key:
            key['filter'] = key['where']
            del key['where']
        
        #if "sort" in key:
            #_sordList = qf.sort(key["sort"])
            #if "filter" not in key:
                #key["filter"] = _sordList
            #else:
                #key["filter"].update(_sordList)
            
            #del key["sort"]
            
        if "fields" in key and type(key["fields"])==list:
            _fmap = {}
            for ele in key["fields"]:
                if ele!="_id":
                    _fmap[ele] = 1
                else:
                    _fmap[ele] = 0

            key["fields"] = _fmap
        
        
        if "fields" in key:
            key["projection"] = key["fields"]
            del key["fields"]
        

        _res = self.mongodb[tb].find(*arg,**key)
        _res = list(_res)
        #for i,ele in enumerate(_res):
            #if "_id" in ele:
                #_res[i]["_id"] = str(_res[i]["_id"])

        return _res
        
    #删除数据
    #@defer.inlineCallbacks
    def delete(self,tb,*arg,**key):
        if 'where' in key:
            key['spec_or_id'] = key['where']
            del key['where'] 
        
        _res = self.mongodb[tb].remove(*arg,**key)
        return _res

    #@defer.inlineCallbacks
    #原始group
    def rawgroup(self,tb,keys,initial, reduces, condition=None, finalize=None):
        _res = self.mongodb[tb].group(keys,initial,reduces,condition,finalize)
        return _res
    
    #原始聚合
    #@defer.inlineCallbacks
    def aggregate(self,tb,pipeline):
        _res = self.mongodb[tb].aggregate(pipeline)
        return _res        
    
    #原始map_reduce
    #@defer.inlineCallbacks
    def map_reduce(self,tb,maps, reduces, out,full_response=False, **kwargs):
        _res = self.mongodb[tb].map_reduce(maps, reduces, out,full_response, **kwargs)
        return _res
    
    #获取随机文档
    #@defer.inlineCallbacks
    def find_rand(self,tb,where,size,keys='',*arg,**kwargs):
        _pipeLine = [
        {"$match":where},
        {"$sample":{"size":size}},
        ]
        if keys!='':
            _tmpKeys = {}
            _pKeys = []
            if isinstance(keys,basestring):
                _pKeys = keys.split(",")
            if isinstance(keys,list) or isinstance(keys,tuple):
                _pKeys = keys
            
            for ele in _pKeys:
                _tmpKeys[ele] = 1
                if ele == "_id":
                    _tmpKeys[ele] = 0

            _pipeLine.append({"$project":_tmpKeys})
            
        _res = self.aggregate(tb,_pipeLine)
        _res = list(_res)
        return _res

    # 随机在大数据表里查找一条记录
    def find1_rand(self,tb,where,**key):
        num = None
        if 'num' in key:
            num = key['num']
            del key['num']
        if num is None:
            num = self.count(tb,where,**key)
        if not num: return None
        randint = random.randint(1,num) - 1
        key['skip'] = randint
        if 'where' not in key: key['where'] = where
        _r = self.find1(tb,**key)
        return _r

    #group
    #ex:_res = g.mdb.group('userinfo',where={'sex':4},groupby='name,binduid',act=['min','age'])
    #@defer.inlineCallbacks
    def group(self,tb,*arg,**key):
        if 'where' in key:
            key['condition'] = key['where']
            del key['where']
        if 'groupby' in key:
            key['key'] = key['groupby'].split(',')
            del key['groupby']
        
        key['reduce']="function(d,r){}"
        
        if 'act' in key:
            if type(key['act'])==type([]):
                f = str(key['act'][1])
                key['initial'] = {"val":0}
                if key['act'][0]=="sum":
                    key['reduce']="function(d,r){ r.val+= d."+ f +" }"
                elif key['act'][0]=="count":
                    key['reduce']="function(d,r){ r.val ++ }"
                elif key['act'][0]=="max":
                    key['reduce']="function(d,r){ if(d."+ f +">r.val)r.val=d."+ f +" }"
                elif key['act'][0]=="min":
                    key['initial'] = {"val":"none"}
                    key['reduce']="function(d,r){ if(r.val=='none')r.val=d."+ f +"; if(d."+ f +"<r.val)r.val=d."+ f +" }"
                elif key['act'][0]=="avg":
                    key['initial'] = {"val":0,"rows":0,"values":0}
                    key['reduce']="function(d,r){r.values+= d."+ f +";r.rows++; }"
                    key['finalize'] = "function(out){out.val+= out.values / out.rows }"
                    
            elif type(key['act'])==type(""):
                key['reduce'] = key["act"]
            
            del key["act"]
        _res = self.mongodb[tb].group(*arg,**key)
        return _res
    
    #计数命令
    #@defer.inlineCallbacks
    def count(self,tb,where=None,**kwargs):
        _res = self.mongodb[tb].count(where,**kwargs)
        return _res
        
    
if __name__=="__main__":
    pass