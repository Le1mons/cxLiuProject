#!/usr/bin/python
#coding:utf-8

'''
重置活动相关方法
'''

import g

#每日限购领取的信息
def getMRXGRecData(uid):
    _ctype = 'meirixiangou_buy'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    _res = {}
    if len(_data ) > 0:
        _res = _data[0]['v']
        
    return _res


#设置每日限购领取的奖励信息
def setMRXGRecData(uid,key):
    _ctype = 'meirixiangou_buy'
    _recData = getMRXGRecData(uid)
    _recData[key] = _recData.get(key, 0) + 1
    # 超过3次就不能再买
    if _recData[key] > g.GC['pre_chongzhihd'][key]['paynum']:
        return False
    g.setAttr(uid,{'ctype':_ctype},{'v':_recData})
    return _recData

#获取所有超值礼包信息
def getCZLBData(uid):
    _res = {}
    _ctype = 'chaozhilibao_data'
    _data = g.getAttr(uid,{'ctype':_ctype})
    if _data == None:
        return _res

    for d in _data:
        if g.C.NOW() < d['v'] or d['v'] == 0:
            _res[d['k']] = d['v']
        
    return _res

#是否可以获取-超值礼包领取信息
def chkCanGet(uid,chkkey):
    _nt = g.C.NOW()
    _ctype = 'chaozhilibao_data'
    _where = {
        'ctype': _ctype,
        'k': chkkey
    }
    _data = g.getAttrOne(uid,_where)
    if _data == None:
        return 1
    
    if _data['v'] != 0 and _nt > _data['v']:
        return 1
    
    return 0

#设置单个超值礼包的信息
#passtime:过期时间，0为永久不过期
def setCZLBByKey(uid,chkkey,passtime):
    _ctype = 'chaozhilibao_data'
    _where = {
        'ctype': _ctype,
        'k': chkkey
    }
    g.setAttr(uid,_where,{'v':passtime})
    return passtime

#设置特权过期时间
def setTQPassTime(uid,tqid,passtime):
    _ctype = 'chongzhi_tequan'
    _where = {
        'ctype': _ctype,
        'k': str(tqid)
    }
    g.setAttr(uid,_where,{'v':passtime})
    g.setAttr(uid,{'ctype':'task_rmbrefresh'},{'v':0})
    return passtime

#是否有特权存在
def isTeQuan(uid,tqid):
    _ctype = 'chongzhi_tequan'
    _where = {
        'ctype': _ctype,
        'k': str(tqid)
    }
    _data = g.getAttrOne(uid,_where)
    if _data == None:
        return 0
    
    _nt = g.C.NOW()
    if _data['v'] == 0 or _data['v'] > _nt:
        return 1

    return 0

#设置过期时间
'''
ctype:week周，month月，forever永久
tqid:特权id，默认无特权id
"1":"探险礼包特权，每日3次免费，8次额外购买次数",
"2":"冒险者礼包特权，悬赏任务首次钻石刷新出紫色",
"3":"英雄礼包特权，悬赏任务3次钻石刷新出橙色"
'''
def setPassTime(uid,chkkey,ctype,tqid=None):
    _passTime = 0
    #默认永不过期
    _passTime = 0
    _zeroTime = g.C.getZeroTime(g.C.NOW())
    
    if ctype == 'week':
        _passTime = _zeroTime + (7 * 24 * 3600)
    elif ctype == 'month':
        _passTime = _zeroTime + (30 * 24 * 3600)
        
    #设置活动过期时间
    setCZLBByKey(uid,chkkey,_passTime)
    #设置特权过期时间
    if tqid:
        setTQPassTime(uid,tqid,_passTime)
        
        
#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    #标识key
    _chkKey = act
    _con = None
    if _chkKey not in g.GC['pre_chongzhihd']:
        return
    
    _con = g.GC['pre_chongzhihd'][_chkKey]
    _hdType = _con['hdtype']
    if _hdType == 'mrxg':
        #每日限购处理
        _res = setMRXGRecData(uid,_chkKey)
        if _res == False:
            g.success[orderid] = False
            return
    elif _hdType == 'czlb':
        #处理重置礼包
        if not chkCanGet(uid,_chkKey):
            g.success[orderid] = False
            return
        _tqid = None
        if 'tq' in _con: _tqid = _con['tq']
        _ctype = _con['ctype']
        setPassTime(uid,_chkKey,_ctype,_tqid)

    _prize = list(_con['prize'])
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'chongzhihd_recprize','prize':_prize,'prid':act})
    g.sendUidChangeInfo(uid,_prizeRes)

# 获取红点
def getHongDian(uid):
    _res = {'czlb3': 0, 'czlb4': 0}
    _data = getCZLBData(uid)
    for i in _res:
        if i not in _data:
            _res[i] = 1
    return {'tqlb': _res}

#监听充值成功事件
g.event.on("chongzhi",onChongzhiSuccess)
    

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    uid = "61240_61ac2f4048fc700a4ebb8293"
    print setPassTime(uid,'czlb2', "month", tqid="1")
    # print getShiliHongDian(uid)