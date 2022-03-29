#coding:utf-8

import g

# 获取配置
def getCon():
    _con = g.GC['qiandao']['base']
    return _con

#获取签到轮次
def getSignRound(uid):
    _res = 0
    _ext = getExtSignRound(uid)
    #如果有特殊显示的轮次
    if _ext != -1:
        return _ext
    _data = g.getAttr(uid, {"ctype": "signed_round"}, keys='v')
    if _data != None: _res = int(_data[0]['v'])
    return _res

#设置签到轮次
def setSignRound(uid,rnum):
    g.setAttr(uid,{"ctype": "signed_round"},{'v':rnum})

#获取特殊记录当第30天时的轮次
def getExtSignRound(uid,key='v'):
    _res = -1
    _data = g.getAttrByDate(uid, {"ctype": "extsignround"})
    if len(_data) > 0:
        _res = int(_data[0][key])
        
    return _res

#设置特殊记录当第30天时的轮次
#rnum:轮次，allnum累计次数,lgtime累计领取下标
def setExtSignRound(uid,rnum,allnum,lgidx):
    print {'v':rnum,'allnum':allnum,'lgidx':lgidx}
    g.setAttr(uid,{"ctype": "extsignround"},{'v':rnum,'allnum':allnum,'lgidx':lgidx})


    
#获取特殊记录当第30天时的次数
def getExtSignNum(uid):
    _res = -1
    _data = g.getAttrByDate(uid, {"ctype": "extsignnum"})
    if len(_data) > 0:_res = int(_data[0]['v'])
    return _res

#设置特殊记录当第30天时的轮次
#def setExtSignNum(uid,rnum):
#    g.setAttr(uid,{"ctype": "extsignnum"},{'v':rnum})

#返回用户签到时的指定将魂
def getPrizeJh(uid):
    _jhCon = g.GC['qiandao']['base']["roundprize"]
    _roundNum = getSignRound(uid)
    _roundNum = int(_roundNum)%len(_jhCon)
    return _jhCon[_roundNum]["jh"]

#返回用户签到时的指定英雄
def getPrizeHero(uid):
    _jhCon = g.GC['qiandao']['base']["roundprize"]
    _roundNum = getSignRound(uid)
    _roundNum = int(_roundNum)%len(_jhCon)
    return _jhCon[_roundNum]["hero"]


#获取每日签到奖励
def getDailySignPrize(uid):
    signinfo = g.GC['qiandao']['base']['everydayprize']
    signedday = getSignDaysNum(uid)
    # print signedday
    currentprize = signinfo[int(signedday)]
    _prize = currentprize["prize"]
    presentjh = getPrizeJh(uid)
    gud = g.getGud(uid)

    if currentprize["isjh"] == 1: #if prize has jh, replace it
        _prize['t'] = presentjh

    if currentprize["isdouble"] == 1: # double prize!
        if gud["vip"] >= int(currentprize["vip"]):
            _prize["n"] *= 2

    return _prize

#获取签到累计次数
def getSignDaysNum(uid):
    _res = 0
    _ext = getExtSignRound(uid)
    #如果有特殊显示的次数
    if _ext != -1:
        return 30
    _data = g.getAttr(uid, {"ctype": "signed_days"})
    if _data != None: _res = int(_data[0]['v'])
    return _res

#设置每日签到次数
def setSignDaysNum(uid,snum):
    g.setAttr(uid, {"ctype": "signed_days"},{'v':snum})

#获取签到累计的总次数
def getSignAllNum(uid):
    _res = 0
    _ext = getExtSignRound(uid,'allnum')
    #如果有特殊显示的次数
    if _ext != -1:
        return _ext
    _data = g.getAttr(uid, {"ctype": "signed_allnum"})
    if _data != None: _res = int(_data[0]['v'])
    return _res

#设置累计签到总次数
def setSignAllNum(uid,num):
    _num = num
    _ext = getExtSignRound(uid,'allnum')
    if _ext == -1:
        g.setAttr(uid,{"ctype": "signed_allnum"},{'v':_num})
    else:
        g.setAttr(uid, {"ctype": "extsignround"},{'allnum':_num})
        
    return _num

#当日是否领取奖励
def isRecPrizeByType(uid,ctype, k=None):
    _isrec = 0
    if not k:
        _data = g.getAttrByDate(uid,{"ctype":ctype})
    else:
        _data = g.getAttrByDate(uid,{"ctype":ctype,"k":int(k)})
    if len(_data) > 0: _isrec = 1
    return _isrec

#获取累积奖励
def getAcSignedPrize(uid, days):
    _con = g.GC["qiandao"]["base"]["lgprize"]
    _prize = _con[int(days)][1]
    return _prize

#返回数组格式累积奖励
def getAcSignedPrizeWithDay(uid, days):
    _p = []
    _idx = int(days)
    _con = g.GC["qiandao"]["base"]["lgprize"]
    #超出索引则取最后的元素
    if len(_con) <= _idx :
        _idx = -1
    _prize = _con[_idx]
    _t = list(_prize[1])
    _p.append(_prize[0])
    _p.append(_t)
    return _p



#获取每日签到信息
def getDailySignInfo(uid):
    _hero = getPrizeHero(uid)
    _isget = isRecPrizeByType(uid,"signed_days")
    _signeddays = getSignDaysNum(uid)

    _r = {"hero":_hero,"isget":_isget,"signeddays":_signeddays,"desc":g.L("sign_sends")+"{1}"}
    return _r

#设置豪华签到状态
def setLuxurySignStatus(uid, mtype, status):
    g.setAttr(uid, {"ctype":"luxury_sign", "k":int(mtype)},{"v": int(status)})

#获取豪华签到状态
def getLuxurySignStatus(uid, mtype):
    _r = 0
    _data = g.getAttrByDate(uid,{"ctype":"luxury_sign", "k":int(mtype)}, keys='v')
    if _data: _r = int(_data[0]['v'])
    return _r

#获取豪华签到信息
def getLuxurySignInfo(uid, mlist):
    _res = {}
    for n in mlist:
        _isget = getLuxurySignStatus(uid, n)
        _prize = getLuxurySignPrize(uid, n)
        _res[str(n)] = {"isget":_isget, "prize":list(_prize)}
   
    return _res

#获取豪华签到奖励
def getLuxurySignPrize(uid, money):
    luxprizeCON = g.GC["luxury_sign"]
    luxday = int(g.C.DATE(fmtStr='%d'))
    luxday = luxday % int(len(luxprizeCON[0]["prize"]))
    _prize = luxprizeCON[int(money)]["prize"][luxday]

    return _prize

#设置累积签到奖励领取情况
def setAcSignPrizeGet(uid, actimes=0):
    _ext = getExtSignRound(uid)
    if _ext == -1:
        g.setAttr(uid, {"ctype": "acsign_prizegets"},{'v':actimes})
    else:
        g.setAttr(uid, {"ctype": "extsignround"},{'lgidx':actimes})

#获取累积签到奖励领取情况
def getAcSignPrizeGet(uid):
    _r = 0
    _ext = getExtSignRound(uid,'lgidx')
    if _ext != -1:
        return _ext
    
    _data = g.getAttr(uid, {"ctype": "acsign_prizegets"}, keys='v')
    if _data:
        _r = _data[0]['v']
    return _r

#获取累积签到信息
def getAcSignInfo(uid):
    _r = {}
    _actimes = getSignAllNum(uid)
    _getday = getAcSignPrizeGet(uid)
    _prize = getAcSignedPrizeWithDay(uid,_getday)
    _gettimes = getAcSignPrizeGet(uid)
    _con = getCon()
    if _gettimes > len(_con['lgprize'])-1:
        _r['isget'] = 1
    _r['times'] = _actimes
    _r['prize'] = _prize
    return _r

#获取每日充值总数
def getDailyChongZhi(uid):
    _num = 0
    _r = g.getAttrByDate(uid,{"ctype":g.L("signed_dailychongzhi_sum")})
    if _r:
        _num = int(_r[0]['v'])

    return _num

#设置每日充值总数
def setDailyChongZhi(uid,money):
    _r = g.setAttr(uid,{"ctype":g.L("signed_dailychongzhi_sum")},{"$inc":{"v":int(money)}})
    return _r

#充值成功事件--需要删除的方法
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    return
    money = int(money)
    # setDailyChongZhi(uid,money)
    # _sum = getDailyChongZhi(uid)
    _con = g.GC['luxury_sign']
    _mtype = 0
    for ele in _con:
        _luxstatus = getLuxurySignStatus(uid,_mtype)
        if payCon['proid'] == ele['pid'] and _luxstatus==0:
            setLuxurySignStatus(uid,_mtype,1)

        _mtype += 1

# 获取可以领取的记录
def chkIfLgPrize(uid):
    signnum = getSignAllNum(uid)
    prizenum = getAcSignPrizeGet(uid)
    _con = getCon()
    _chkNum = _con['lgprize'][-1][0]
    if prizenum < len(_con['lgprize']):
        _chkNum = _con['lgprize'][prizenum][0]
        
    _retVal = [False, -1, -1]
    for i, ele in enumerate(_con['lgprize']):
        if ele[0] >= _chkNum and ele[0] <= signnum:
            _retVal = [True, i, ele[0]]
            break

    return _retVal

#监听充值成功事件
g.event.on("chongzhi",onChongzhiSuccess)

if __name__=='__main__':
    uid = g.buid("zzz1")
    #print uid
    #setLuxurySignStatus(uid,1,1)
    #print getAcSignInfo(uid)
    #print getPrizeJh(uid)
    #print type(getLuxurySignInfo(uid,[0,1])["0"]["prize"])
    #print setLuxurySignStatus(uid,0,2)
    #print g.C.DATE(fmtStr='%d')
    print chkIfLgPrize(uid)
    # g.event.emit("chongzhi",uid,'1',5,'111',{'config':'a'})