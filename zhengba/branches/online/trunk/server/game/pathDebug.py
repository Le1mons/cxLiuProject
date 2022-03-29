#!/usr/bin/python
#coding:utf-8
import g,sys


class DebugMongo(g.m.dbmongo.MongoDB):
    def __init__(self,config):
        print '[debug] use DebugMongo'
        super(DebugMongo, self).__init__(config)
    
    #获取表的索引列表
    def _getIndexes(self,tb):
        res = []
        indexlist = self.mongodb[tb].index_information()
        for index,v in indexlist.items():
            key = v['key']
            for kinfo in key:
                res.append(kinfo[0])
        return res

    def update(self,tb,where,data,**key):
        if 'RELEASE' in key:
            del key['RELEASE']
            return super(DebugMongo, self).update(tb,where,data,**key)
        
        if(len(where)==0):
            print '[error] update, len(where)==0'
            print tb,where,data
            return
        
        indexs = self._getIndexes(tb)
        if 'uid' in indexs:
            if 'uid' not in where or len(where)<2:
                print '[error] update, uid not in where or len(where)<2'
                print tb,where,data
                return   
        
        return super(DebugMongo, self).update(tb,where,data,**key)
    
    
    def delete(self,tb,*arg,**key):
        if 'RELEASE' in key:
            del key['RELEASE']
            return super(DebugMongo, self).delete(tb,*arg,**key)
        
        where = None
        
        if 'where' in key:
            where = key['where']
        elif len(arg)>0:
            where = arg[0]
        
        if not where:
            print '[error] delete, where==None'
            print tb,arg,key
            return
        
        indexs = self._getIndexes(tb)
        if 'uid' in indexs:
            if 'uid' not in where or len(where)<2:
                print '[error] delete, uid not in where or len(where)<2'
                print tb,arg,key
                return   
        
        return super(DebugMongo, self).delete(tb,*arg,**key)
        

#如果是临时脚本，则监测容错
if (sys.argv[0]).find('patch_')!=-1 and (sys.argv[0]).find('nopatch')==-1:
    g.mdb = DebugMongo(g.conf['DBCONFIG'])