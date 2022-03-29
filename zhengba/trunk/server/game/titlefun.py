#!/usr/bin/python
# coding:utf-8

'''
封爵相关方法
'''
import g


# 充值成功事件
def onChongzhiSuccess(uid, act, money, orderid, payCon):
    # 标识key
    _chkKey = act
    _con = g.GC['chongzhihd']["jueweilibao"]
    if _chkKey not in _con:
        return

    _con = _con[_chkKey]

    # 判断是否还有购买次数
    _lessNum = getLiBaoNum(uid, _chkKey)
    if _lessNum:
        return
    # 设置购买
    setLiBaoNum(uid, _chkKey)

    _prize = list(_con['prize'])
    _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'chongzhihd_title', 'prize': _prize, 'prid': act})
    g.sendUidChangeInfo(uid, _prizeRes)


# 设置礼包的购买次数
def setLiBaoNum(uid, chkKey):
    _ctype = chkKey
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": 1})


# 获取礼包
def getLiBaoNum(uid, chkKey):
    _ctype = chkKey
    _w = {"ctype": _ctype}
    # _num = 0
    _res = 0
    # 获取总共能购买的次数
    _con = g.GC['chongzhihd']["jueweilibao"][chkKey]
    _buyNum = _con["buynum"]
    _type = _con["ctype"]
    if _type == "day":
        _data = g.getAttrByDate(uid, _w)
        if _data:
            # _num = _data[0]["v"]
            _res = 1
    else:
        # 获取今天零点时间戳
        # _nt = g.C.NOW()
        # _zt = g.C.ZERO(_nt)
        _data = g.getAttrOne(uid, _w)
        if _data:
            # 获取购买基金的初始时间
            # _ctime = _data["lasttime"]
            # _czt = g.C.ZERO(_ctime)
            # if _ctime + 30 * 3600 * 24 >= _zt:
            _res = 1

    return _res



# 设置今天是否领取每日奖励
def setDayPrize(uid, chkkey):
    _ctype = g.C.STR("{1}_dayprize", chkkey)
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": 1})


# 判断今天是否领取每日奖励
def chkDayPrize(uid, chkkey="jueweilibao_3"):
    _ctype = g.C.STR("{1}_dayprize", chkkey)
    _w = {"ctype": _ctype}
    _res = 0
    _isbuy = getLiBaoNum(uid, chkkey)
    # 判断是否购买礼包
    if not _isbuy:
        return 1
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _res = _data[0]["v"]

    return _res


# 检查今天是否领取每日奖励
def chkFreeDayPrize(uid):
    _ctype = "title_freeprize"
    _w = {"ctype": _ctype}
    _res = 0
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _res = _data[0]["v"]

    return _res


# 设置今天领取每日奖励
def setFreeDayPrize(uid):
    _ctype = "title_freeprize"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": 1})


# 设置今天购买勋章的次数
def setDayBuyNum(uid, num):
    _ctype = "title_buynum"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": num})


# 获取今天购买勋章的次数
def getDayBuyNum(uid):
    _ctype = "title_buynum"
    _w = {"ctype": _ctype}
    _res = 0
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _res = _data[0]["v"]

    return _res


# 红点、
def getHD(uid):
    _num = g.getAttrByCtype(uid, 'title_cost_1')
    _con = g.GC['titlecom']['libao']
    # 每日的礼包
    if _num >= _con['1']['val']:
        return 1
    _num = g.getAttrByCtype(uid, 'title_cost_2', bydate=False, k=g.C.getWeekNumByTime(g.C.NOW()))
    if _num >= _con['2']['val']:
        return 1

    return 0

# 监听累计消费
def onLeijixiaofei(uid, _type, val):
    if g.getOpenDay() < 22 or _type != 'rmbmoney' or val > 0:
        return
    val = abs(val)

    _con = g.GC['titlecom']['libao']
    _lbval = g.getAttrByCtype(uid, 'title_cost_1')
    _num1 = 0
    if _lbval != -1:
        # 礼包1
        _num1 = _lbval + val
        g.setAttr(uid, {'ctype': 'title_cost_1'}, {'v': _num1})

    _key = g.C.getWeekNumByTime(g.C.NOW())
    _lbval = g.getAttrByCtype(uid, 'title_cost_2', bydate=False, k=_key)
    _num2 = 0
    # 礼包2
    if _lbval != -1:
        _num2 = _lbval + val
        g.setAttr(uid, {'ctype': 'title_cost_2'}, {'v': _num2, 'k': _key})
    if _num2 >= _con['2']['val'] or _num1 >= _con['1']['val']:
        g.m.mymq.sendAPI(uid, 'title_redpoint', '1')


# 检查日常任务是否完成
@g.m.taskfun.checkResetDailyTask
def chkDailyTaskOver(uid):
   return bool(g.mdb.find1('task',{'uid':uid,'type':2,'isreceive':1,'taskid':'1'},fields={'_id':1}))

# 监听充值成功事件
g.event.on("chongzhi", onChongzhiSuccess)
g.event.on('leijixiaofei', onLeijixiaofei)

if __name__ == "__main__":
    uid = g.buid('Q16')
    a = getHongDian(uid)
    print a