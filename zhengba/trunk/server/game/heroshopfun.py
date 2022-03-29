#!/usr/bin/python
#coding:utf-8

import g

'''
英雄限时活动相关方法
'''

#获取配置信息
def getCon():
    return g.GC['heroshop']['base']

#获取英雄商店配置
def getHeroShop(uid):
    _ctype = 'heroshop_shopdata'
    _shopData = g.getAttrOne(uid,{'ctype':_ctype})
    if _shopData == None:
        return
    
    _nt = g.C.NOW()
    if _shopData['passtime'] < _nt:
        #已过期
        return
    
    _res = {'lv':int(_shopData['k']),'shop':_shopData['v'],'passtime':_shopData['passtime']}
    return _res

#设置英雄商店信息
def setHeroShop(uid,slv,passtime,shop):
    _ctype = 'heroshop_shopdata'
    g.setAttr(uid,{'ctype':_ctype},{'k':slv,'v':shop,'passtime':passtime})
    return 1

#删除商店信息
def delHeroShop(uid):
    _ctype = 'heroshop_shopdata'
    g.delAttr(uid,{'ctype':_ctype})
    return 1

#创建英雄商店
def createHeroShop(uid):
    _nt = g.C.NOW()
    _passTime = _nt +3*3600
    gud = g.getGud(uid)
    _lv = gud['uid']
    _con = getCon()['lvshop']
    _tmpCon = _con[0]['shop']
    _tmpLv = 30
    for ele in _con:
        _tmpLv = ele['lv']
        if _lv < _tmpLv:
            break
        _tmpCon = ele['shop']
        
    _shopCon = list(_tmpCon)
    _shopData = getHeroShop(uid)
    _numList = []
    if _shopData != None:
        for d in _shopData['shop']:
            _numList.append(d['maxbuy'])
            
    _idx = 0
    #如果商店存在，则增加上次未购买完的次数
    _newData = []
    for d in _shopCon:
        _tmp = d
        if len(_numList) > _idx: _tmp['maxbuy'] += _numList[_idx]
        _newData.append(_tmp)
    
    setHeroShop(uid,_tmpLv,_passTime,_newData)
    g.sendHeroShopShow(uid,{'passtime':_passTime})
    return _newData

#添加新将领
def onChangeHeroAdd(uid,eventType,heroData):
    _biaoqian = int(heroData['biaoqian'])
    if _biaoqian < 2:
        return
    
    gud = g.getGud(uid)
    if gud['lv'] < 30:
        return
    _data = createHeroShop(uid)


#新武将添加事件
g.event.on("addhero",onChangeHeroAdd)

if __name__=='__main__':
    uid = g.buid("fenghua10")
    print createHeroShop(uid)