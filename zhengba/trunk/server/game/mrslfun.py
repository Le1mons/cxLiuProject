#!/usr/bin/python
#coding:utf-8

import g

'''
每日试练功能
'''
# 获取每日试练配置
def getMrslCon(_type, mid):
    _con = g.GC['meirishilian'][_type]
    return _con[mid]

# 获取剩余次数
def getLessNum(uid, _type):
    _lessNum = 2
    # 购买次数
    _buyNum = getBuyNum(uid, _type)
    _lessNum += _buyNum
    # 已用的次数
    _pkNum = getPkNumByType(uid, _type)
    _lessNum -= _pkNum

    if _lessNum < 0: _lessNum = 0
    return _lessNum


# 获取购买次数
def getBuyNum(uid, _type):
    _key = g.C.STR('mrsl_buynum_{1}', _type)
    return g.getPlayAttrDataNum(uid,_key)


# 设置购买次数
def setBuyNum(uid, _type, num=1):
    _key = g.C.STR('mrsl_buynum_{1}', _type)
    return g.setPlayAttrDataNum(uid, _key, num)


# 获取已挑战次数
def getPkNumByType(uid, _type):
    _key = g.C.STR('mrsl_pknum_{1}', _type)
    return g.getPlayAttrDataNum(uid,_key)

# 增加挑战次数
def addPkNum(uid, _type):
    _key = g.C.STR('mrsl_pknum_{1}', _type)
    return g.setPlayAttrDataNum(uid, _key)

# 获取每日最大购买次数
def getMaxBuyNum(uid):
    _maxNum = 2
    _vipNum = g.m.vipfun.getTeQuanNumByAct(uid, 'MRSLBuyPkNum')
    _maxNum += _vipNum
    return _maxNum

# 获取购买次数所需要的物品
def getBuyNeed(uid, _type):
    _buyNeed = g.GC['meirishiliancon']['buyneed']
    _buyNum = getBuyNum(uid, _type)
    return _buyNeed[str(_buyNum+1)]

# 获取暴击概率
def getCritProba(_type):
    _list = g.GC['meirishiliancon']['baoji'][_type]
    _baseP = sum(map(lambda x:x['p'], _list))
    _resData = g.C.RANDARR(_list, _baseP)
    _num = _resData['num']
    return _num

if __name__ == '__main__':
    _res = {}