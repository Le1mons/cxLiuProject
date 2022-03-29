#!/usr/bin/python
#coding:utf-8

'''
世界树管理模块
'''
import g

# 世界树果实id配置
FRUIT_ITEMID = '2011'

# 世界树精华id配置
ESSENCE_ITEMID = '2012'

# 获取世界树果实和精华
def getFruitAndEssence(uid):
    _res = {FRUIT_ITEMID:0,ESSENCE_ITEMID:0}
    _w = {'uid':uid,'itemid':{'$in':_res.keys()}}
    _data = g.mdb.find('itemlist', _w)
    for d in _data:
        _res[str(d['itemid'])] = d['num']

    return _res

# 获取配置
def getWorldTreeCon():
    return g.GC['worldtree']['base']

# 暂存置换的英雄信息
def setSwapHero(uid, hid):
    _w = {'ctype': 'worldtree_swap'}
    data = {'hid': hid}
    g.setAttr(uid,_w,data)

# 获取暂存的置换英雄信息
def getSwapHero(uid):
    _w = {'ctype': 'worldtree_swap'}
    _heroInfo = g.getAttrOne(uid,_w)
    return _heroInfo


if __name__ == '__main__':
    print getFruitAndEssence('0_5aea81d0625aee4a04a0146d')