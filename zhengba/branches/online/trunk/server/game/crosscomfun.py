#!/usr/bin/python
#coding:utf-8


'''
跨服公共方法
'''

import g

# 跨服attr表
def CATTR():
    return g.BASEDB(g.crossDB, 'playattr', 'crossplayattr')

#获得区服列表
def getServerData(iscache=1):
    _nt = g.C.NOW()
    _key = "CROSS_SERVERDATALIST"
    _cData = g.crossMC.get(_key)
    #如果有缓存，且未过期，则直接返回缓存值
    if iscache and _cData!=None and _nt < _cData['reftime']: return _cData
    #刷新缓存数据
    _serverlist = g.crossDB.find("serverdata",{},fields=["_id"],sort=[['opentime',1]])
    _sidlist = []
    _serverdatalist = {}
    for _server in _serverlist:
        _sid = str(_server['serverid'])
        _sidlist.append(_sid)
        _serverdatalist[_sid] = _server

    if len(_sidlist) > 0:
        #下次刷新时间
        _reftime= _nt + 1800
        _ncData = {"list":_sidlist,"data":_serverdatalist,"reftime":_reftime}
        #写入缓存
        g.crossMC.set(_key,_ncData)
        g.m.gameconfigfun.setGameConfig({'ctype':'SERVERDATA'},_ncData)
    else:
        #如果没数据取本地临时数据
        _ncData =  g.m.gameconfigfun.getGameConfig({'ctype':'SERVERDATA'})
        
    return _ncData

#删除区服缓存
def delServerListCache():
    _cacheKey = 'CROSS_SERVERDATALIST'
    g.crossMC.delete(_cacheKey)

#根据sid获取区服名称
def getSNameBySid(sid):
    _data = getServerData()
    if 'data' not in _data:
        return 'unknown'
    
    _data = _data['data']
    sid = str(sid)
    if sid in _data:
        return _data[sid]['servername']
    else:
        return "unknown"
    
    
#设置crossconfig
def setGameConfig(w,data):
    _where = w
    _nt = g.C.NOW()
    _gameConfig = getGameConfig(_where,keys={"_id":1})
    _data = data
    _data['lasttime'] = _nt
    if len(_gameConfig) == 0:
        _data.update(_where)
        _data['ctime'] = _nt

    _newData = {"$set":{}}
    _ispreix = "".join(_data.keys()).find("$")
    if _ispreix>=0:
        for k,v in _data.items():
            if not str(k).startswith("$"):
                _newData["$set"].update({k:v})
            else:
                _newData.update({k:v})
    else:
        _newData = _data
        
    if "$set" in _newData and len(_newData["$set"])==0:
        del _newData["$set"]
        
    _res = g.crossDB.update('crossconfig',_where,_newData,upsert=True)
    return _res


#获取crossconfig
def getGameConfig(where,keys='_id',*arg,**kwargs):
    if keys!='' and isinstance(keys,str) or isinstance(keys,unicode):
        kwargs['fields'] = keys.split(",")
    
    if isinstance(keys,dict):
        kwargs['fields'] = keys

    _w = where
    _res = g.crossDB.find("crossconfig",_w,*arg,**kwargs)
    return _res

#格式化玩家的跨服数据
def fmtCrossUserData(uid,fightdata,stype=2):
    gud = g.getGud(uid)
    if gud == None:
        return
    _userData = {}
    _userData['uid'] = uid
    _userData['sid'] = int(gud['sid'])
    _userData['name'] = gud['name']
    _userData['lv'] = int(gud['lv'])
    _userData['head'] = g.m.userfun.getShowHead(uid)
    _userData['maxzhanli'] = int(gud['maxzhanli'])
    _userData['fightdata'] = fightdata
    # _userData['lasttime'] = now()
    return _userData


    

if __name__=='__main__':
    _dd = [1,2,3,4,5,6]
    print getSNameBySid(1)
    # uid = '0_5760ed8c6a5d091544ac8fd6'
    # _prizeCon = g.m.crosszbfun.getCon()['jifen']['dateprize']
    # print _prizeCon
    # print getServerData(0)
    