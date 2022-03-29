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
    _bsData = getBaoShiData(uid,tid)
    if _bsData == None:
        return _buff
    
    _lv = _bsData[0]
    _buffid = str(_bsData[1])
    _bsCon = getBaoshiCon(str(_lv))
    _buff = [_bsCon['buff'][_buffid]]
    return _buff


# 设置buff表里的宝石属性
def setBuffInfo(uid, buff):
    _w = {'uid': uid}
    _data = {'buff.baoshi': buff}
    g.mdb.update('buff', _w, _data, upsert=True)

if __name__ == '__main__':
    reSetBaoshiBuff('0_5aea7b67625aee5548970d49', 20, '2')
