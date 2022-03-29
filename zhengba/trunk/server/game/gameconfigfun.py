#!/usr/bin/python
#coding:utf-8

'''
游戏公共配置和功能记录的相关方法
'''
import g

#数据库取值方法
def db_getGameConfig(where,keys='',*arg,**kwargs):
    if keys!='' and isinstance(keys,basestring) or isinstance(keys,unicode):
        kwargs['fields'] = keys.split(",")
    
    if isinstance(keys,dict):
        kwargs['fields'] = keys

    _w = where
    _res = g.mdb.find("gameconfig",_w,*arg,**kwargs)
    return _res


#添加数据
def db_addGameConfig(data):
    _oid = g.mdb.insert('gameconfig',data)
    return _oid

#改数据
def db_updateGameConfig(where,data):
    _res = g.mdb.update('gameconfig',where,data)
    return _res

#设置gameconfig
def setGameConfig(where,data):
    _w = where
    _nt = g.C.NOW()
    _gameConfig = getGameConfig(where,keys={"_id":1})
    _data = data
    _data['lasttime'] = _nt
    if len(_gameConfig) == 0:
        _data.update(where)
        _data['ctime'] = _nt
        _res = db_addGameConfig(_data)
    else:
        _res = db_updateGameConfig(where,_data)
        
    return (_res)
    

#增加GameConfig

def addGameConfig(data):
    _nt = g.C.NOW()
    if isinstance(data,dict):
        _data = {}
        _data.update(data)
        _data.update({"ctime":_nt,"lasttime":_nt})
    
    elif isinstance(data,list):
        _data = []
        for ele in data:
            _tmpData = {}
            _tmpData.update(ele)
            _tmpData.update({"ctime":_nt,"lasttime":_nt})
            _data.append(_tmpData)
        
    _r = db_addGameConfig(_data)
    return (data)

#获取gameconfig
def getGameConfig(where,keys='_id',*arg,**kwargs):
    _res = db_getGameConfig(where,keys,*arg,**kwargs)
    return _res

    
#获取一条gameconfig信息

def getOneGameCon(where,keys=''):
    _data = getGameConfig(where,keys)
    if len(_data) == 0:
        return (None)
        
    return (_data[0])

#整理公告格式
def prettyNoticeFmt(rawcontent):
    _res = []
    for c in rawcontent:
        _item = {}
        _item['type'] = c['v']['stype']
        _item['title'] = c['v']['title']
        _item['content'] = c['v']['content']
        _res.append(_item)

    return _res

#根据时间过滤取出数据,当日过期
def getGameConfigByDate(where,time=0,keys='_id',*args,**kwargs):
    if keys!='':
        kwargs["fields"] = keys.split(",")
        #kwargs["fields"] += ["lasttime"]
    
    _r = getGameConfig(where,keys,*args,**kwargs)
    _res = []
    _nt = g.C.NOW()
    if _r!=None:
        for ele in _r:
            #范围内的值都取出
            if g.C.chkSameDate(_nt,int(ele["lasttime"]),time)!=False:
                if keys.find("lasttime")==-1:del ele["lasttime"]
                _res.append(ele)
        
    return _res


    
if __name__=="__main__":
    print getGameConfigByDate({'ctype': 'dayueka_prize'})
