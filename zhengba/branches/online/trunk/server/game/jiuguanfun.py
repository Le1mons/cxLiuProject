#!/usr/bin/python
#coding:utf-8

#酒馆相关逻辑

import g, datetime


def setIsFirstIn(uid):
    g.setAttr(uid, {"ctype":"jiuguan_isfirst"},{'v':1})

#判断是否第一次进酒馆
def isFirstIn(uid):
    _is = 0
    _d = g.getAttr(uid, {"ctype":"jiuguan_isfirst"})
    if _d:
        _is = _d[0]['v']
    return _is

def getJiuGuanUseNum(uid, jtype):
    num = 0
    _r = g.getAttr(uid, {'ctype':'jiuguan_usenum', 'k':str(jtype)})
    if _r:
        num = int(_r[0]['v'])

    return num

def setJiuGuanUseNum(uid, jtype):
    num = getJiuGuanUseNum(uid, jtype)
    _r = g.setAttr(uid, {'ctype':'jiuguan_usenum', 'k':str(jtype)}, {'v': num + 1})
    return _r

#获取酒馆配置
def getJiuguanCon():
    _con = g.GC.jiuguan["con"]
    return _con

#获取酒馆盛宴抽取次数
def getShenYanNum(uid):
    _fnum = 0
    _r = g.getAttr(uid, {"ctype":g.L(g.C.STR("JIUGUAN_USENUM_1"))})
    if _r!=None :
        _fnum = int(_r[0]["v"])
        
    return (_fnum)

#增加盛宴抽取次数
def addShenYanNum(uid):
    _r = g.setAttr(uid, {"ctype":g.L(g.C.STR("JIUGUAN_USENUM_1"))}, {"$inc":{"v":1}})
    return (_r)


#获取所有消耗信息
def getNeedInfo():
    _con = getJiuguanCon()
    _needInfo = {"0":_con["0"]["need"],"1":_con["1"]["need"],"10":_con["10"]["need"]}
    return (_needInfo)
    
#获取所有免费信息 返回k/v 
def getFreeInfo(uid):
    _con = getJiuguanCon()
    _freeMaps = {"0":{"fnum":_con["0"]["freenum"]},"1":{"fnum":_con["1"]["freenum"]}}
    _ctypes = [g.L("JIUGUAN_FREENUM_0"),g.L("JIUGUAN_FREENUM_1")]
    _nt = g.C.NOW()
    for i,ctype in enumerate(_ctypes):
        _res = g.getAttrByTime(uid, {"ctype":ctype},_con[str(i)]["freetime"])
        if len(_res)>0:
            _fnum = int(_res[0]["v"])
            _freeMaps[str(i)]["fnum"] = _fnum
            if _fnum==0:
                del _freeMaps[str(i)]["fnum"]
                _freeMaps[str(i)]["ftime"] = _res[0]['lasttime'] + _con[str(i)]['freetime']#_con[str(i)]["freetime"] + _nt
    
    # 豪宴免费次数
    _hyfreeinfo = getHaoyanFreeInfo(uid)
    _freeMaps['10'] = _hyfreeinfo
    return (_freeMaps)

#获取免费抽取次数
def getFreeNum(uid,jtype):
    _con = getJiuguanCon()[str(jtype)]
    _fnum = int(_con["freenum"])
    _r = g.getAttrByTime(uid, {"ctype":g.L(g.C.STR("JIUGUAN_FREENUM_{1}",jtype))}, _con["freetime"])
    if len(_r)>0:
        _fnum = int(_r[0]["v"])
        
    return _fnum

#设置免费次数
def setFreeNum(uid,jtype,num):
    _r = g.setAttr(uid, {"ctype":g.L(g.C.STR("JIUGUAN_FREENUM_{1}",jtype))}, {"v":num})
    return (_r)

#获取酒馆vip信息
def getJiuguanVip(uid):
    #获取酒馆折扣次数
    _vipinfo = g.m.vipfun.getJiuguanVip(uid)
    if _vipinfo==None:
        return (None)
        
    for k,v in _vipinfo.items():
        _ctype = g.L(g.C.STR("JIUGUAN_VIPSALE_{1}",k))
        #获取每日vip已使用折扣次数
        _r = g.getAttrByDate(uid, {"ctype":_ctype },v["rtime"])
        if len(_r)>0:
            v["snum"] = int(_r[0]["v"])
        
        #v["rtime"] = g.C.NOW(g.C.getDate()) + 24*3600 + v["rtime"]

    return (_vipinfo)

#设置vip折扣使用次数
def setVipSaleNum(uid,jtype,num):
    _ctype = g.L(g.C.STR("JIUGUAN_VIPSALE_{1}",jtype))
    _r = g.setAttr(uid, {"ctype":_ctype}, {"v":int(num)})
    return (_r)

#监听VIP变化事件
def onVipChange(uid,oldlv,newlv):
    _oldnum = g.m.vipfun.getTequanNumByVip(oldlv,1)
    _newnum = g.m.vipfun.getTequanNumByVip(newlv,1)
    if _newnum <= _oldnum: return
    _vipinfo = getJiuguanVip(uid)
    if not _vipinfo: return
    for k,v in _vipinfo.items():
        _rsnum = v['snum'] + _newnum - _oldnum
        setVipSaleNum(uid,k,_rsnum)

# 获取开服时间戳
def getOpenTimestamp():
    _opentime = g.getOpenTime()
    _zt = g.C.NOW(g.C.DATE(_opentime))
    return _zt

# 获取酒馆本轮兑换的将领
def getDuihuanArmy(dhround):
    dhround = int(dhround)
    _con = g.GC['jiuguan']
    _prize = {}
    for k, v in _con['duihuan'].items():
        _, _round = divmod(dhround, len(v['prize']))
        _prize.update({k : v['prize'][_round]})

    return _prize

# 获取兑换配置
def getDuihuanCon():
    _con = g.GC['jiuguan']['duihuan']
    return _con

# 获取本轮兑换将领
def getRoundDuihuanArmy(uid):
    _prize = []
    _round = getRound()
    _extRound = g.m.statfun.getMyStat(uid, 'jiuguan_duihuan_extraround')
    _round += _extRound
    # 开服时间的零点
    _r = g.getAttr(uid, {'ctype':'jiuguan_duihuan_army', 'k': _round})
    if _r:
        _prize = _r[0]['v']

    else:
        _prize = getDuihuanArmy(_round)
        g.setAttr(uid, {'ctype':'jiuguan_duihuan_army', 'k': _round}, {'v': _prize})

    return _prize

# 获取两个时间间隔的7天轮次
def getRound(stime=None, etime=None):
    stime = stime or getOpenTimestamp()
    etime = etime or g.C.NOW(g.C.DATE())
    _ddays = (datetime.datetime.fromtimestamp(etime) - datetime.datetime.fromtimestamp(stime)).days
    _round, _ = divmod(_ddays, 7)
    _round += 1
    return _round

# 获取豪宴的round
def getHaoyanRound(uid):
    stime = getUserStime(uid)
    etime = g.C.NOW(g.C.DATE())
    _waittime = g.GC['jiuguan']['con']['10']['waittime']
    # 第一轮
    if etime < stime + _waittime:
        _round = 1

    else:
        _ddays = (datetime.datetime.fromtimestamp(etime - _waittime) - datetime.datetime.fromtimestamp(stime)).days
        _round, _ = divmod(_ddays, 7)
        _round += 2

    return _round

# 获取玩家本轮次数
def getRoundNum(uid, ctype, haoyanround = False):
    _num = 0
    _round = getRound()
    if haoyanround:
        _round = getHaoyanRound(uid)

    _r = g.getAttr(uid, {'ctype': ctype, 'k': _round})
    if _r:
        _num = _r[0]['v']

    return _num

# 设置玩家本轮次数
def setRoundNum(uid, ctype, haoyanround = False):
    _num = getRoundNum(uid, ctype)
    _round = getRound()
    if haoyanround:
        _round = getHaoyanRound(uid)

    _r = g.setAttr(uid, {'ctype':ctype, 'k': _round}, {'v': _num + 1})
    return _r

# 获取豪宴免费次数及时间
def getHaoyanFreeInfo(uid):
    _freetime = getNextRefTime(uid)
    _hynum = getHaoYanNum(uid)
    _num = 0 if _hynum else 1
    # 第一轮默认没有次数
    _hyround = getHaoyanRound(uid)
    if _hyround <= 1:
        _num = 0

    _value = {'fnum': _num}
    if _num == 0:
        _value.update({'ftime': _freetime})

    return _value

def getUserStime(uid):
    gud = g.getGud(uid)
    _st = g.C.ZERO(gud['ctime'])
    return _st

# 获取下次更新时间
'''
    初始刷新时间为玩家注册时间，
'''
def getNextRefTime(uid):
    _st = getUserStime(uid)
    _round =  getHaoyanRound(uid)
    _waittime = g.GC['jiuguan']['con']['10']['waittime']
    _freetime =  _st + _waittime + (_round - 1) * 7 * 24 * 3600
    return _freetime

# 获取名望兑换将领下次刷新时间
def getMingwangDuihuanRefTime():
    _stime = getOpenTimestamp()
    _round = getRound()
    _etime = _stime + _round * 7 * 24 * 3600
    return _etime

# 获取本轮玩家兑换次数
@g.deprecated
def getDuihuanNum(uid):
    return getRoundNum(uid, 'jiuguan_duihuan_num')

# 设置本轮玩家兑换次数
@g.deprecated
def setDuihuanNum(uid):
    return setRoundNum(uid, 'jiuguan_duihuan_num')

def getHaoYanNum(uid):
    return getRoundNum(uid, 'jiuguan_haoyan_num', haoyanround=True)

def setHaoYanNum(uid):
    return setRoundNum(uid, 'jiuguan_haoyan_num', haoyanround=True)

# 获取已领取奖励
def getMWGotArr(uid):
    _val = []
    _r = g.getAttr(uid, {'ctype':'jiuguan_duihuan_gotarr'})
    if _r:
        _val = _r[0]['v']    

    return _val

# 设置已领取奖励
def setMWGotArr(uid, dhtype):
    _gotArr = getMWGotArr(uid)
    _gotArr.append(dhtype)
    _con = g.GC['jiuguan']['duihuan']
    if len(_gotArr) >= len(_con):
        _gotArr = []
        g.m.statfun.acStat(uid, 'jiuguan_duihuan_extraround', 1)

    _r = g.setAttr(uid, {'ctype':'jiuguan_duihuan_gotarr'}, {'v':_gotArr})
    return _r

# 格式化显示数据
def fmtDisplayData(uid):
    _retVal = {}
    _con = g.GC['jiuguan']['duihuan']
    _gotArr = getMWGotArr(uid)
    _prize = getRoundDuihuanArmy(uid)
    for k,v in _con.items():
        _tmp = {
            'needmingwang': _con[k]['needmingwang'],
            'ifduihuan': 1 if k in _gotArr else 0,
            'prize': _prize[k]
        }
        _retVal.update({k: _tmp})

    return _retVal

#监听VIP变化事件
g.event.on('viplvchange',onVipChange)


if __name__=="__main__":
    uid = g.buid('gch')
    # print fmtDisplayData(uid)
    # print setMWGotArr(uid, '1')
    # print getRound()
    print getMingwangDuihuanRefTime()