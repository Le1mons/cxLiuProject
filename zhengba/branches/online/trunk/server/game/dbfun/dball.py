#!/usr/bin/python
#coding:utf-8

#逻辑较为公共的db操作
import g

#写入日志
def writeLog(uid,acttype,data):
    _data = {}
    _data["ctime"] = g.C.NOW()
    _data["uid"] = uid
    _data["type"] = acttype
    _data["ttltime"] = g.C.TTL()
    _data['data'] = data
    _oid = g.mdb.insert('gamelog',_data)
    return _oid

#写入钻石消耗日志
def addRmbmoneyLog(uid,rmbmoney,act,data):
    _data = {}
    rmbmoney = int(rmbmoney)
    act = str(act)
    _data["ctime"] = g.C.NOW()
    _data["uid"] = uid
    _data["rmbmoney"] = rmbmoney
    _data["act"] = act
    _data["data"] = data
    _oid = g.mdb.insert('rmbmoneylog',_data)
    return _oid

#获取所有通关攻略日志
def getAllPassLog(*arg,**kwargs):
    _res = g.mdb.find("passlog",*arg,**kwargs)
    return _res

#获取通关攻略日志
def getPassLog(uid,ftype):
    _w = {"uid":uid,"ftype":ftype}
    _res = getAllPassLog(_w)
    return _res

#修改通关日志
def setPassLog(where,newdata):
    _w = where
    _res = g.mdb.update("passlog",_w,newdata)
    return _res

#添加通关攻略日志
def addPassLog(uid,ftype,data):
    data["ctime"] = g.C.NOW()
    data["uid"] = uid
    data["ftype"] = ftype
    _oid = g.mdb.insert("passlog",data)
    return _oid


#设置统计数据
def setStat(uid,ctype,data):
    _w = {"uid":uid,"ctype":ctype}
    _data = {"$set":{}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$")!=-1:
        _data.update(data)
    else:
        _data["$set"].update(data)
        
    _data["$set"]["lasttime"] = _nt
    _oid = g.mdb.update("stat",_w,_data,upsert=True)
    return _oid

#获取统计数据
def getStatInfo(where=None,*arg,**kwarg):
    return g.mdb.find("stat",where,*arg,**kwarg)

#根据uid 获取所有统计数据
def getStatByUid(uid,ctype=None,*arg,**kwarg):
    _w = {"uid":uid}
    if ctype!=None:
        _w.update({"ctype":ctype})
    
    return getStatInfo(_w,*arg,**kwarg)


#获取支付列表数据
def getPayListInfo(where=None,*arg,**kwarg):
    _res = g.mdb.find("paylist",where,*arg,**kwarg)
    return _res

#添加支付数据
def addPayListInfo(data):
    _res = g.mdb.insert("paylist",data)
    return _res

#获取封禁数据
#cytpe 1假禁言
#ctype 2真禁言
#ctype 3封号
def getBlackList(uid,ctype=-1,where=None,keys='',*arg,**kwargs):
    ctype = int(ctype)
    if keys!='':
        kwargs["fields"] = keys.split(",")
    
    _w = {}
    _w.update({"uid":uid})
    #过滤ctype
    if ctype!=-1:_w.update({"ctype":ctype})
    #覆盖where条件
    if where!=None:_w.update(where)
    _res = g.mdb.find("blacklist",_w,*arg,**kwargs)
    return _res

#添加使用兑换码数据
def addUseCard(uid,card):
    _data = {"uid":uid,"cardnum":card,"ctime":g.C.NOW()}
    _res = g.mdb.insert("cardlog",_data)
    return _res


#获取卡数据
def getCardInfo(uid,card,*arg,**kwarg):
    card = str(card)
    _res = g.mdb.find("cardlog",{"uid":uid,"cardnum":card},*arg,**kwarg)
    return _res