#!/usr/bin/python
#coding:utf-8

import g

'''
商店功能
'''

# 获取shopitem的配置
def getShopItemCon(sid=''):
    if sid:
        return g.GC['pre_shopitem'][sid]
    return g.GC['pre_shopitem']

# 获取shop的配置
def getShopCon(sid=''):
    if sid:
        return g.GC['shop'][sid]
    return g.GC['shop']

# 生成商店物品
def genrateShopItems(shopid):
    _shopCon = getShopCon(shopid)
    _shopItem = _shopCon['shopitem']
    _res = list()
    _con = getShopItemCon()
    for _idx,i in enumerate(_shopItem):
        _itemCon = _con[str(i)]
        _prize = g.C.RANDARR(_itemCon['items'], _itemCon['base'])
        _prize['idx'] = _idx
        _res.append(_prize)

    return _res

# 获取商店数据
def getShopData(uid, shopid, isref=False):
    _w = {'uid':uid, 'shopid':shopid}
    _shopInfo = g.mdb.find1('shops', _w)
    _nt = g.C.NOW()
    # 自动刷新时间到了
    # 如果数据不存在 或者 强制刷新
    if not _shopInfo or isref or (_shopInfo.get('autotime',_nt) < _nt and _shopInfo.get('autotime',_nt)!=-1) or (_shopInfo['freetime'] <= _nt and _shopInfo['freetime']!=-1):
        # 生成商店显示的物品
        _shopData = genrateShopItems(shopid)

        _nt = g.C.NOW()
        _freeTime = getRefreshTime(shopid)

        _shopInfo = {
            'shopid': shopid,
            'ctime': _nt,
            'freetime': _freeTime,
            'shopitem': _shopData
        }
        if not isref:
            _shopInfo['autotime'] = getAtuoRefTime(shopid)
        # 设置到数据库
        setShopData(uid,shopid,_shopInfo)

    if '_id' in _shopInfo: del _shopInfo['_id']
    return _shopInfo

# 获取商店自动刷新时间
def getAtuoRefTime(sid):
    _con = getShopCon(sid)
    if _con['autoreftime'] == -1:
        return -1
    else:
        return g.C.ZERO(g.C.NOW() + _con['autoreftime'])

# 获取下一次将要刷新的时间
def getRefreshTime(shopid):
    _hour = g.C.HOUR()
    _con = getShopCon(shopid)
    _nt = g.C.NOW()
    _freeTime = _con['rseconds']
    # 根绝当前时间加上秒数
    if _con['rseconds'] != -1:
        _freeTime = _nt + _con['rseconds']
    # 如果根绝时辰刷新
    elif _con['rtimes']:
        _maxHour = max(_con['rtimes'])
        # 最大时辰小于当前时辰 就取明天的最小时辰
        if _maxHour <= _hour:
            _freeTime = g.C.ZERO(_nt+24*3600) + min(_con['rtimes'])
        # 取其中最靠近现在的时辰的时间戳
        else:
            for i in xrange(_hour, _maxHour + 1):
                if i in _con['rtimes']:
                    _freeTime = _nt + (i - _hour) * 3600

    return _freeTime

# 设置shops信息
def setShopData(uid, shopid, data):
    _w = {'uid': uid,'shopid':shopid}
    g.mdb.update('shops', _w, data,upsert=True)


# 获取公共商店
def getCommonShop(uid, sid):
    _nt = g.C.NOW()
    _cacheKEY = "COMMONSHOP_%s" % sid
    _cacheInfo = g.mc.get(_cacheKEY)
    if _cacheInfo == None:
        _rdata = genrateShop(uid, sid, 1)
        g.mc.set(_cacheKEY, _rdata)
    else:
        _rdata = _cacheInfo

    _nnt = _nt + 24 * 3600
    # 永远不刷新
    _rdata["rtime"] = _nnt
    _rdata["rnumtime"] = _nnt
    _rdata["fnum"] = 0
    _rdata["maxfnum"] = 0
    return _rdata


# 检查购买条件是否满足,不满足返回False和错误消息
def checkBuyCond(uid, cond, itemidx, num=1, *arg, **kwarg):
    itemidx = int(itemidx)
    _retVal = (True,)
    # 秘境历史星级到达x星
    if cond[0] == 1:
        _mjInfo = g.m.mijingfun.getMijingInfo(uid, keys='_id,hstar')
        _num = 0
        if _mjInfo != None: _num = _mjInfo["hstar"]
        if _num < cond[1]:
            _retVal = (False, g.L("shopbuy_cond_1_msg", _num))

    # 公会限购x次
    elif cond[0] == 2:
        _retVal = g.m.gonghuifun.checkShopBuyCond(uid, cond, itemidx, num, *arg, **kwarg)

    # 铁匠铺限购当前等级符文
    elif cond[0] == 3:
        _retVal = g.m.tiejiangpufun.checkShopBuyCond(uid, cond, itemidx, num, *arg, **kwarg)

    return _retVal


# 处理商店附加信息
def hookShopInfo(uid, sid, data):
    sid = int(sid)
    # 处理公会商店信息
    if sid == 9:
        g.m.gonghuifun.hookShopInfo(uid, sid, data)

    return


# 处理商店购买后附加信息
def hookShopBuyInfo(uid, sid, idx, itemcon, shopinfo):
    sid = int(sid)
    idx = int(idx)
    # 处理公会商店购买后附加信息
    if sid == 9:
        g.m.gonghuifun.hookShopBuyInfo(uid, sid, idx, itemcon, shopinfo)

    return

# 获取每天剩余刷新次数
def getLessRfNum(uid, sid):
    _maxNum = g.GC['shop'][sid]['dailyrfnum']
    return _maxNum - getUsedRfNum(uid, sid)

# 获取每天的使用次数
def getUsedRfNum(uid, sid):
    return g.getAttrByCtype(uid,'shop_dailyusedrfnum',default={}).get(sid, 0)

# 获取每天的花费使用次数
def getUsedCostRfNum(uid, sid):
    return g.getAttrByCtype(uid,'shop_dailyusedcostrfnum',default={}).get(sid, 0)

if __name__ == '__main__':
    a = g.mdb.find('userinfo',{})
    print getAtuoRefTime('7')