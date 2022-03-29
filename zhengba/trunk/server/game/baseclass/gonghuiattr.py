#!/usr/bin/python
#coding:utf-8

import g
from dbbase import DBBASE
    
#类似playattr格式的操作类
class GONGHUIATTR(DBBASE):
    #db:数据库连接
    #tablename:表名
    def __init__ (self,db,tablename):
        super(GONGHUIATTR,self).__init__(db,tablename)
        self.db = db
        self.tbname = tablename
        
    #获取playAttr属性
    def getAttr(self,ghid,where,keys='',**kwargs):
        _w = where
        _w.update({"ghid":ghid})
        _res = self.getData(_w,keys,**kwargs)
        return _res
    
    #获取一条playAttr属性
    def getAttrOne(self,ghid,where,keys='',**kwargs):
        _w = where
        _w.update({"ghid":ghid})
        _res = self.getOne(_w,**kwargs)
        return _res
    
    #根据时间过滤取出attr,当日过期
    #time:过期时间修正值，0默认为每日的零点，单位秒数
    def getAttrByDate(self,ghid,where,time=0,keys='',**kwargs):
        _w = where
        _w['ghid'] = ghid
        _res = self.getByDate(_w,time,'lasttime',keys,**kwargs)
        return _res
    
    #根据时间过滤取出attr,lasttime + time 后过期,time秒数
    def getAttrByTime(self,ghid,where,time=0,**kwargs):
        _w = where
        _w['ghid'] = ghid
        _res = self.getByTime(_w,time,'lasttime',**kwargs)
        return _res
    
    #设置信息
    def setAttr(self,ghid,where,data):
        _w = where
        _w['ghid'] = ghid
        return self.setData(_w,data)
    
    #获取相关功能当天的次数
    def getPlayAttrDataNum(self,ghid,ctype,w={},ptime=0):
        _where = {}
        _where['ctype'] = ctype
        if len(w) > 0: _where.update(w)
        _res = 0
        _data = self.getAttrByDate(ghid,_where,ptime)
        if len(_data) == 0:
            return _res
        _res = _data[0]['v']
        return _res
        
    #设置相关功能当天的次数
    def setPlayAttrDataNum(self,ghid,ctype,num=1,w={},ptime=0):
        _num = self.getPlayAttrDataNum(ghid,ctype,w,ptime)
        _resNum = _num  + num
        _where = {'ctype':ctype}
        if len(w) > 0: _where.update(w)
        self.setAttr(ghid, _where , {"v":_resNum})
        return _resNum
    

    
#GHATTR = GONGHUIATTR(g.mdb,'gonghuiattr')

if __name__ == '__main__':
    pass
    
