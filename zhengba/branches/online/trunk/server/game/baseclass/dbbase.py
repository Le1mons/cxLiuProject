#!/usr/bin/python
#coding:utf-8

import g
    
#数据操作基类
class DBBASE(object):
    #db:数据库连接
    #tablename:表名
    def __init__ (self,db,tablename):
        self.db = db
        self.tbname = tablename
        
    #获取数据列表
    def getData(self,where,keys='',**kwargs):
        _w = where
        if keys!='':
            kwargs["fields"] = keys.split(",")
            
        _res = self.db.find(self.tbname,_w,**kwargs)
        return _res
    
    #获取一条数据
    def getOne(self,where,keys='',**kwargs):
        _w = where
        if keys!='':
            kwargs["fields"] = keys.split(",")
            
        _res = self.db.find1(self.tbname,_w,**kwargs)
        return _res
    
    #根据时间过滤取出attr,当日过期
    #time:过期时间修正值，0默认为每日的零点，单位秒数
    def getByDate(self,where,time=0,lasttimekey='lasttime',keys='',**kwargs):
        if keys!='':
            kwargs["fields"] = keys.split(",")
            kwargs["fields"] += [lasttimekey]
        
        _r = self.getData(where,**kwargs)
        _res = []
        _nt = g.C.NOW()
        if _r!=None:
            for ele in _r:
                #范围内的值都取出
                if g.C.chkSameDate(_nt,int(ele[lasttimekey]),time)!=False:
                    if keys.find(lasttimekey)==-1:del ele[lasttimekey]
                    _res.append(ele)
            
        return _res
    
    #根据时间过滤取出attr,lasttime + time 后过期,time秒数
    def getByTime(self,where,time=0,lasttimekey='lasttime',**kwargs):
        _r = self.getData(where,**kwargs)
        _res = []
        _nt = g.C.NOW()
        if _r!=None:
            for ele in _r:
                #范围内的值都取出
                if ele[lasttimekey] + time >= _nt >= ele[lasttimekey]:
                    _res.append(ele)
            
        return _res
    
    #设置信息
    def setData(self,where,data):
        _w = where
        _nt = g.C.NOW()
        _newData = {"$set":{}}
        data["lasttime"] = _nt
        _exists = self.db.find1(self.tbname,_w)
        if _exists == None:
            data["ctime"] = _nt
        
        _ispreix = "".join(data.keys()).find("$")
        if _ispreix>=0:
            for k,v in data.items():
                if not str(k).startswith("$"):
                    _newData["$set"].update({k:v})
                else:
                    _newData.update({k:v})
        else:
            _newData = data
        
        if "$set" in _newData and len(_newData["$set"])==0:
            del _newData["$set"]
            
        _res = self.db.update(self.tbname,_w,_newData,upsert=True)
        return _res
    
    #删除数据
    def delData(self,where):
        _w = where
        _res = self.db.delete(self.tbname,_w)
        return _res

#数据模型类工厂
class DBBaseFactory:
    #格式化数据工厂类
    #db:数据库对象
    #model:实例类型
    #tbname:表名
    def creactDB(self,db,model,tbname):
        obj = None
        #try:
        _fileName = g.C.STR("{1}",model.upper())
        exec("from %s import %s"%(model,_fileName))
        _mathod = _fileName+'(db,tbname)'
        obj = eval(_mathod)
        #except:
            #print 'Not Exist ftype --',ftype
        #except:
        #print 'Create FIGHT Errors'

        return obj

#实例化DB工厂
DBFactory = DBBaseFactory()

if __name__ == '__main__':
    pass

