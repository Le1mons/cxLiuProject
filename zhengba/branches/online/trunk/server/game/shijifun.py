#!/usr/bin/python
#coding:utf-8

import g

'''
市集功能
'''

#获取市集配置
def getShijiCon(types=''):
    types = str(types)
    _con = g.GC["shiji"]
    if types!='':
        return _con[types]
        
    return _con

#获取今日免费次数
def getFreeNum(uid,types):
    types = str(types)
    _con = getShijiCon(types)
    _freeNum = 0
    _nt = g.C.NOW()
    _r = g.getAttr(uid, {"ctype":g.L("playattr_ctype_sjfreenum"),"k":types}, keys='_id,v,lasttime')
    if _r!=None:
        #是同一天,优先增加的次数
        _freeNum = int(_r[0]["v"])

    return _freeNum

#设置今日免费次数
def setFreeNum(uid,types,num):
    types = str(types)
    num = int(num)
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_sjfreenum"),"k":types}, {"v":num})
    return (_r)

#增加免费次数
def addFreeNum(uid):
    gud = g.getGud(uid)
    for types in [1,2,3]:
        types = str(types)
        _con = getShijiCon(types)
        #满足开放级别。增加次数
        if gud["lv"] >= _con["openlv"]:
            _w = {"ctype":g.L("playattr_ctype_sjfreenum"),"k":types}
            _r = g.setAttr(uid, _w, {"$inc":{"v":1}})

#获取最大可购买次数
def getMaxNum(uid,types):
    types = str(types)
    _con = getShijiCon(types)
    _vipType = {"1":"JiShiYinBi","2":"JiShiLiangCao","3":"JiShiJingTie"}
    _vipNum = g.m.vipfun.getTeQuanNumByAct(uid,_vipType[types])
    _maxBuyNum = _con["maxnum"] + _vipNum
    return _maxBuyNum

#获取剩余最大征收征收次数
#剩余次数=免费次数+可购买次数
def getLessNum(uid,types):
    types = str(types)
    _con = getShijiCon(types)
    _maxBuyNum = _con["maxnum"]#最大可购买次数
    _vipType = {"1":"JiShiYinBi","2":"JiShiLiangCao","3":"JiShiJingTie"}
    _vipNum = g.m.vipfun.getTeQuanNumByAct(uid,_vipType[types])
    _maxBuyNum += _vipNum
    # _r = g.getAttrByDate(uid, {"ctype":g.L("playattr_ctype_sjlessnum"),"k":types},time=_con["maxtime"])
    # if len(_r)>0:
    #     _lessNum = int(_r[0]["v"])
    
    # _freeNum = getFreeNum(uid,types)
    _buyNum  = getBuyNum(uid,types)
    _lessNum = _maxBuyNum - _buyNum
    return (_lessNum)

#设置剩余最大可征收次数
def setLessNum(uid,types,num):
    types = str(types)
    num = int(num)
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_sjlessnum"),"k":types}, {"v":num})
    return (_r)    
     
#获取消耗黄金的购买次数
def getBuyNum(uid,types):
    types = str(types)
    #如果是第一次购买，默认次数为1
    _r = g.getAttrByDate(uid, {"ctype":g.L("playattr_ctype_sjbuynum"),"k":types},time=0)
    if len(_r)>0:
        _buyNum = int(_r[0]["v"])
    else:
        _buyNum = 0

    return (_buyNum)

#设置消耗黄金的购买次数
def setBuyNum(uid,types,num):
    types = str(types)
    num = int(num)
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_sjbuynum"),"k":types}, {"v":num})
    return (_r)

#设置连续不暴击次数
def setNotBjNum(uid,types,num=None):
    types=str(types)
    if num!=None:
        num = int(num)
        _r = g.setAttr(uid,{"ctype":g.L("playattr_ctype_sjnbjnum"),"k":types},{"v":num})
    else:
        _r = g.setAttr(uid,{"ctype":g.L("playattr_ctype_sjnbjnum"),"k":types},{"$inc":{"v":1}})
    return _r

#获得连续不暴击次数
def getNotBjNum(uid,types):
    #初值为-1，用来判断是否曾经使用过
    types = str(types)
    _num = -1
    _r = g.getAttr(uid,{"ctype":g.L("playattr_ctype_sjnbjnum"),"k":types})
    if _r!=None:
        _num = int(_r[0]['v'])

    return _num

#获取购买消耗
#num 当前是第几次购买
def getBuyNeed(uid,types,num=None):
    types = str(types)
    _con = getShijiCon(types)
    if num==None:
        num = getBuyNum(uid, types)
    
    _need = {"a":"attr","t":"rmbmoney"}
    # print "num",num
    _need["n"] = _con["buyneed"][num]

    return (_need)

#获取兑换获取的奖励
#生成的集市信息需要保存下来。
def getExchangePrize(types,lv):
    types = str(types)
    _con = getShijiCon(types)
    _sjinfo = {"a":"attr"}
    _sjinfo['t'] = str(_con['itemtype'])
    _sjinfo['n'] = _con["shopnum"][lv]

    # g.setAttr("uid",{"ctype":"sjinfo"},{"k":types,"v":_sjinfo})

    return _sjinfo

#获取暴击倍数
def getBaojiPro(uid,types):
    types = str(types)
    _randNum = g.m.common.random.randint(1,100)
    _bjpro = 1
    _notBjNum = getNotBjNum(uid,types)
    # print "***not bj num",_notBjNum
    #如果连续10次不暴击或第一次，则本次必暴击2倍
    if _notBjNum in (10,-1):
        # print "***not bj num",_notBjNum
        #将不暴击次数清零
        setNotBjNum(uid,types,0)
        _bjpro=2
        return _bjpro

    #vip可以三倍暴击检测
    _vipChk = g.m.vipfun.getTeQuanNumByAct(uid,'ShiChangBaoJi')
    if 1 <=_randNum <=10:
        #1-20出3倍
        _bjpro = 2
    elif 11 <= _randNum <=15 and _vipChk:
        #20-30出2倍
        _bjpro = 5

    #如果暴击次数为1，增加没有暴击的次数
    if _bjpro==1:
        #如果暴击为1，则记录不暴击次数
        setNotBjNum(uid,types)
    else:
        #否则设置暴击次数为0
        setNotBjNum(uid,types,0)
    
    return _bjpro

if __name__ == "__main__":
    uid = "0_57a1a1816a5d098c0ccdade1"
    # print getFreeNum(uid,2)
    # _rd = {}
    # for i in xrange(1,101):
    #     _r = getBaojiPro(uid)
    #     if _r not in _rd.keys():
    #         _rd[_r] = 0
    #     _rd[_r] += 1
    #     print i,_r

    # print _rd
    for i in xrange(1,4):
        print getLessNum(uid,)
    #     print getFreeNum(uid,2)
    #     print getBuyNum(uid,2)
    # print getBaojiPro(uid,3)
    print getLessNum(uid)