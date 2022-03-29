#!/usr/bin/python
#coding:utf-8

'''
统计类相关方法
'''
import g

#设置统计数据
def setStat(uid,ctype,data):
    _res = g.m.dball.setStat(uid,ctype,data)
    return (_res)

#获取统计数据
def getStatInfo(where=None,keys='',*arg,**kwarg):
    if keys!='':
        kwarg["fields"] = keys.split(",")
        
    _res = g.m.dball.getStatInfo(where,*arg,**kwarg)
    return (_res)

#根据uid 获取所有统计数据
def getStatByUid(uid,ctype=None,keys='',*arg,**kwarg):
    if keys!='':
        kwarg["fields"] = keys.split(",")
        
    _res = g.m.dball.getStatByUid(uid,ctype,*arg,**kwarg)
    return (_res)

#获取当前统计值
def getMyStat(uid,ctype=None):
    _num = 0
    _w = {"uid":uid,"ctype":ctype}
    _r = g.mdb.find("stat",_w)
    if len(_r)>0:
        _num = _r[0]['v']

    return _num

#累加积分
def acStat(uid, ctype, anum):
    _num = 0
    _record = getStatInfo({'uid':uid,'ctype':ctype},keys='v')
    if _record:
        _num = _record[0]['v']
        
    _resNum = _num+int(anum)
    setStat(uid, ctype, {'v':_resNum})
    return _resNum
    
    
#每天只记录一次数据
def setStatByDate(uid,ctype,v):
    _data = getStatByUid(uid,ctype,keys='_id,v,lasttime')
    if len(_data) > 0 and g.C.DATE(_data[0]['lasttime']) == g.C.DATE():
        return
    _res = setStat(uid, ctype, {'v':v})
    return _res

#记录最大上限值
def setStatByMax(uid,ctype,v):
    _val = getStatVal(uid,{'ctype':ctype})
    if _val > v:
        return
    _res = setStat(uid,ctype, {'v':v})
    return _res

#记录每一天的记录
def getStatByEveryDay(uid,ctype,defval=0):
    _w = {'uid':uid,'ctype':ctype}
    _data = g.mdb.find1('stat',_w,fields=["_id","v","lasttime"])
    _res = defval
    #无记录返回默认值
    if _data == None:
        return _res
    
    #如果不是同一天返回默认值
    if g.C.DATE(_data['lasttime']) != g.C.DATE():
        return _res
    
    return _data['v']

#统计当天数据
def setStatByEveryDay(uid,ctype,v,defval=0):
    _val = getStatByEveryDay(uid,ctype,defval)
    _resVal = _val + v
    setStat(uid, ctype, {'v':_resVal})
    return _resVal
    

#获取统计记录值
def getStatVal(uid,where,defval=0):
    _res = defval
    _w = {'uid':uid}
    _w.update(where)
    _data = g.mdb.find1('stat',_w)
    if _data == None:
        return _res
    
    return _data['v']


if __name__=="__main__":
    uid=g.buid('xz999')