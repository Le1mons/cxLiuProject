#!/usr/bin/python
#coding:utf-8

import g

'''
    收复城池 公共方法
'''

#读取配置
def getCon():
    _con = g.GC['shoufuchengchi.json']['base']
    return _con

#每个区域最后一个guanka配置
def getLastGuankaCon():
    _con = g.GC['lastguanka']
    return _con

#获取关卡区域对应配置
def getGuankaAreaCon():
    _con = g.GC['guanka2area']
    return _con

#获取区域对应奖励
def getAreaPrizeCon():
    _con = g.GC['area2prize']
    return _con

#设置当前关卡进度
def setSfccInfo(uid,areaid):
    _r = g.setAttr(uid,{"ctype":"sfccinfo"},{"$push":{"gotarr":areaid}})
    return _r

#获得当前奖励状态
def getSfccInfo(uid):
    _gotarr = []
    _r = g.getAttr(uid,{"ctype":"sfccinfo"},keys="_id,gotarr")
    if _r!=None:
        _gotarr = _r[0]['gotarr']

    return _gotarr

#判断当前管卡是否有收复城池奖
def getAreaPrizeByGuakaId(uid,guankaid):
    gud = g.getGud(uid)
    guankaid = int(guankaid)
    _retVal = []
    #判断该管卡是否是该城池最后一个管卡
    _cityidx = 0
    _cityname = ''
    for k,v in g.GC['city'].items():
        if v['guanka'] and v['guanka'][-1] == guankaid:
            _cityidx = v['idx']
            _cityname = str(k)

    if not _cityidx: return _retVal
    #区域id
    _area = getGuankaAreaCon()[guankaid]
    _con = g.GC['area2prize']
    # 如果配置不存在则返回
    if int(_area) not in _con: return _retVal
    _cond = g.GC['area2prize'][int(_area)]['condition']
    if _cond.keys()[0] not in ("city","lv"):
        return _retVal

    _key,_value = _cond.keys()[0],_cond.values()[0]
    #如果条件是城池，且城池不匹配则返回
    if _key == "city" and _value != _cityname:
        return _retVal

    if _key == 'lv' and gud[str(_key)]<int(_value):
        return _retVal

    _retVal = getAreaPrizeCon()[int(_area)]['dlprize']
    return _retVal

if __name__ == "__main__":
    uid = g.buid("gch")
    for i in xrange(0,500):
        _r = getAreaPrizeByGuakaId(uid,i)
        if _r:
            print _r