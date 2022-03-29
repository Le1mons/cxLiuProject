#!/usr/bin/python
# coding:utf-8

import g

'''
宝石通用方法
'''


# 获取宝石配置
def getBaoshiCon(bid=''):
    if bid:
        return g.GC['baoshi'][bid]
    return g.GC['baoshi']

#获取宝石信息
def getBaoShiData(uid,tid):
    _data = g.m.herofun.getUserwearInfo(uid, tid)
    if _data == None:
        return
    
    _bsType = '6'
    if _bsType not in _data:
        return
    
    _lv, _buffid = _data[_bsType].items()[0]
    #返回等级和buff编号
    return (_lv,_buffid)
    
    

# 重置宝石buff
def reSetBaoshiBuff(uid, bsLv, buffNum):
    _bsCon = getBaoshiCon(str(bsLv))
    _buff = _bsCon['buff'][buffNum]
    return _buff



#获取宝石buff
#tid:英雄tid
def getBuff(uid,tid):
    _buff = []
    _w = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    _heroInfo = g.mdb.find1('hero', _w, fields=['weardata', "baoshijinglian"]) or {}
    _userwear = _heroInfo.get("weardata", {})
    _jinglian = _heroInfo.get("baoshijinglian", 0)
    if not _userwear.get("6"):
        return _buff
    _lv, _buffid = _userwear["6"].items()[0]
    _bsCon = getBaoshiCon(str(_lv))
    _buff = [_bsCon['buff'][_buffid]]
    _jinglianCon = g.GC["baoshijinglian"]
    if str(_buffid) in _jinglianCon:
        _extBuff = _jinglianCon[str(_buffid)][str(_jinglian)]["buff"]
        _buff.append(_extBuff)

    return _buff


# 设置buff表里的宝石属性
def setBuffInfo(uid, buff):
    _w = {'uid': uid}
    _data = {'buff.baoshi': buff}
    g.mdb.update('buff', _w, _data, upsert=True)

# 获取重铸的奖励
def getRecastPrize(lv):
    _con = getBaoshiCon()
    _prize = []
    for i in range(1, lv):
        _prize += list(_con[str(i)]['lvupneed'])

    return g.fmtPrizeList([i for i in _prize if i['t'] != 'jinbi'])

if __name__ == '__main__':
    print getRecastPrize(1)
