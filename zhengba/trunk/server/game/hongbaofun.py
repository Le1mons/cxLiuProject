#!/usr/bin/python
#coding:utf-8


'''
至尊相关接口
'''

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g



#获取配置
def getCon():
    return g.GC['hongbao']['base']

#发放红包时的生成数据
def fmtHongBaoData(hbid):
    _hbid = str(hbid)
    _con = getCon()
    _hbCon = _con['hongbao'][_hbid]
    #发送红包的个数
    _sendNum = _hbCon['hongbaonum']
    #发送奖励的总数量
    _sendPrizeNum = _hbCon['sendprizenum']
    #每个红包的最小值
    _minNum = _hbCon['minprizenum']
    #把最小数额放进红包数组
    _hbList = [_minNum] * _sendNum
    _randMaxNum = _sendPrizeNum - (_sendNum * _minNum)
    _idx = 0
    for i in xrange(_sendNum):
        if _idx == _sendNum - 1:
            #最后一个红包
            _tmpRand = _randMaxNum
        else:
            #随机剩下金额的数量
            _tmpRand = g.C.RANDINT(0,_randMaxNum)
            
        _hbList[_idx] += _tmpRand
        _randMaxNum -= _tmpRand
        if _randMaxNum <= 0:
            break
        _idx += 1
        
    _res = {}
    _res['isover'] = 0
    _res['hbid'] = _hbid
    _res['hbname'] = _hbCon['name']
    #奖励类型
    _res['ptype'] = _hbCon['ptype']
    #提前随机出的红包数量
    _res['hbdata'] = _hbList
    #领取红包玩家的列表
    _res['recdata'] = []
    _res['chkdata'] = {}
    _res['ctime'] = g.C.NOW()
    _res['ttltime'] = g.C.getTTLTime()
    return _res
    
#获取对应tid红包的信息
def getHongBaoData(tid):
    _tid = g.mdb.toObjectId(tid)
    _where = {'_id':_tid}
    _hbdata = g.mdb.find1('hongbao',_where)
    return _hbdata



#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    '''_money = str(int(money))
    _con = getCon()
    if _money not in _con['paynum2hbitem']:
        return
    
    #根据重置的对应阶获取红包
    _hbItemId = _con['paynum2hbitem'][_money]
    _prize = [{"a":"item","t":_hbItemId,"n":1}]
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'hongbao_chongzhi_gethongbao','prize':_prize})
    g.sendUidChangeInfo(uid,_prizeRes)'''
    return


#监听充值成功事件
g.event.on("chongzhi",onChongzhiSuccess)

if __name__ == "__main__":
    uid = g.buid("fenghua10")