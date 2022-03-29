#!/usr/bin/python
#coding:utf-8

'''
探险相关方法
'''

import g

#获取地图信息
def getMapCon(mid):
    return g.GC['tanxianmap'][str(mid)]

#获取玩家最大免费探险次数
def getMaxFreeTxNum(uid):
    _maxFreeNum = g.GC['tanxiancom']['base']['freetxnum']
    #  VIP增加免费次数 探险者礼包特权
    if g.m.chongzhihdfun.isTeQuan(uid,1):
        _maxFreeNum = 3
    return _maxFreeNum

#获取已经使用免费探险的次数
def getFreeTXNum(uid):
    _ctype = 'tanxian_usefreenum'
    return g.getPlayAttrDataNum(uid,_ctype)

#设置已经使用免费探险的次数
def setFreeTXNum(uid):
    _ctype = 'tanxian_usefreenum'
    return g.setPlayAttrDataNum(uid,_ctype)

#获取可免费挑战的次数
def getCanFreeNum(uid):
    _maxNum = getMaxFreeTxNum(uid)
    _doNum = getFreeTXNum(uid)
    _canNum = _maxNum - _doNum
    if _canNum < 0: _canNum = 0
    return _canNum

#获取当天已经探险的次数（非免费次数探险）
def getTXNum(uid):
    _ctype = 'tanxian_usenum'
    return g.getPlayAttrDataNum(uid,_ctype)

#设置当天已经探险的次数（非免费次数探险）
def setTXNum(uid):
    _ctype = 'tanxian_usenum'
    return g.setPlayAttrDataNum(uid,_ctype)

#获取最大可购买次数
def getMaxTxNum(uid):
    _maxNum = g.GC['tanxiancom']['base']['maxbuynum']
    # VIP增加免费次数
    if g.m.chongzhihdfun.isTeQuan(uid,1):
        _maxNum = 8
    # 探险先锋活动
    if g.m.huodongfun.chkZCHDopen('tanxian'):
        _maxNum += g.GC['zchuodong']['400']['data']['addition']
    return _maxNum


#获取需要计算挂机时间的数据信息-2018-6-4暂停使用，逻辑修改未统一记录挂机时间,以免逻辑修改回来，注释待复用
def __getGuaJiTimeData(uid):
    _res = {}
    _nt = g.C.NOW()
    gud = g.getGud(uid)
    #当前挂机id
    _mapid = str(gud['mapid'])
    _ctype = 'tanxian_guajitime'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    #最后一次领取奖励的时间，默认为玩家建号时间
    _lastRecTime = gud['ctime']
    if _data != None:
        _lastRecTime = int(_data['lastrectime'])
        _res = _data['v']
        
    _sumGjTime = 0
    if len(_res) > 0:
        _sumGjTime = sum(_res.values())
        
    _maxGJTime = g.GC['tanxiancom']['base']['maxgjtime']
    #当前地图已经挂机的时间
    _cdtime = _nt - _lastRecTime
    #容错处理
    if _cdtime < 0: _cdtime = 0
    #挂机上限处理
    _maxAdd = _maxGJTime - _sumGjTime
    if _cdtime > _maxAdd: _cdtime = _maxAdd
    
    if _cdtime > 0:
        if _mapid in _res:
            _res[_mapid] += _cdtime
        else:
            _res[_mapid] = _cdtime

    return _res



#获取需要计算挂机时间的数据信息
def getGuaJiTimeData(uid):
    _nt = g.C.NOW()
    gud = g.getGud(uid)
    _ctype = 'tanxian_guajitime'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    #最后一次领取奖励的时间，默认为玩家建号时间
    _lastRecTime = gud['ctime']
    if _data != None:
        _lastRecTime = int(_data['lastrectime'])

    _gjTime = _nt - _lastRecTime
    _maxGJTime = g.GC['tanxiancom']['base']['maxgjtime']
    # vip特权 增加挂机时间上限
    _vipHour = g.m.vipfun.getTequanNum(uid, '107')
    _maxGJTime += _vipHour * 60 * 60
    if _gjTime > _maxGJTime: _gjTime = _maxGJTime
    return _gjTime

#设置需要计算挂机时间的数据信息-跳转地图时记录未领取对应地图的奖励时长-跳转前执行记录 -2018-6-4逻辑修改，暂时弃用
def __setGuaJiTimeData(uid):
    _data = getGuaJiTimeData(uid)
    _ctype = 'tanxian_guajitime'
    _setData = {}
    _setData['v'] = _data
    _setData['lastrectime'] = g.C.NOW()
    g.setAttr(uid,{'ctype':_ctype},_setData)
    return _data

#清理挂机信息
def clearGuaJiTime(uid):
    _ctype = 'tanxian_guajitime'
    _setData = {}
    _setData['v'] = 0
    _setData['lastrectime'] = g.C.NOW()
    g.setAttr(uid,{'ctype':_ctype},_setData)
    

#根据挂机时间
#gjdata: {1:2500}-{mapid : 挂机秒数} - 2018-6-4 根据需求修改为挂机秒数 3600
#hasrandprize:是否计算随机奖励
def getGuaJiPrize(uid,gjdata,hasrandprize=0):
    _res = []
    '''
    #参数格式被修改为数字，判断暂时保留，以免会再次修改回来
    if len(gjdata) == 0:
        return _res
        '''
    
    if gjdata < 5:
        return _res
    
    gud = g.getGud(uid)
    #确认各个地图挂机相加的奖励信息
    #最小挂机奖励秒数系数
    _minPro = 0.2
    #获取挂机奖励的最大系数
    _minPrizeSec = 300
    #最大挂机过的地图id-用于计算资源奖励
    _maxGjMapid= getMaxGjMapid(uid)
    _nowGjMapid = gud['mapid']
    _chkData = {str(_maxGjMapid):gjdata}
    _tqProArr = {
        'jinbi':g.m.vipfun.getTeQuanNumByAct(uid,'GuaJiExtJinBi'),
        'exp':g.m.vipfun.getTeQuanNumByAct(uid,'GuaJiExtUserExp'),
        'useexp':g.m.vipfun.getTeQuanNumByAct(uid,'GuaJiExtHeroExp')
    }
    
    for mapid,sec in _chkData.items():
        _pro = int(sec * _minPro)
        if _pro < 1:
            #不足最小挂机奖励单位
            continue
        
        _mapCon = getMapCon(mapid)
        for t,v in _mapCon['gjprize'].items():
            _tqPro = 1
            if t in _tqProArr and _tqProArr[t] > 0:
                _tqPro = 1 + _tqProArr[t] * 0.01
            _tmp = {'a':'attr','t':t,'n':int(v * _pro * _tqPro)}
            _res.append(_tmp)
            
        if not hasrandprize or sec < _minPrizeSec:
            #不计算随机奖励
            continue
        
        _randPrizeCon = getMapCon(_nowGjMapid)
        _loopNum = int(sec / _minPrizeSec )
        for i in xrange(_loopNum):
            _randPrize = g.m.diaoluofun.getGroupPrize(_randPrizeCon['randgroup'])
            if len(_randPrize) == 0:
                continue
            
            _res += _randPrize
    
    _res = g.fmtPrizeList(_res)
    return _res

#获取探险主界面信息
def getTanXianMain(uid):
    _res = {}
    #挂机时间 {mid:sec} || {} -- 2018-6-4 修改为挂机秒数
    _gjTimeData = getGuaJiTimeData(uid)
    _res['gjtime'] = _gjTimeData
    _res['gjmapid'] = getMaxGjMapid(uid)
    #挂机奖励 [{atn}] || [] -- 无物品奖励，显示属性奖励
    _res['gjprize'] = getGuaJiPrize(uid,_gjTimeData)
    #当天可免费探险次数
    _res['freetxnum'] = getCanFreeNum(uid)
    #最大可购买探险次数
    _res['maxbuytxnum'] = getMaxTxNum(uid)
    #当天已经探险次数
    _res['txnum'] = getTXNum(uid)
    #已领取的阶段奖励下标
    _res['passprizeidx'] = getPassPrizeIdx(uid)
    # 探险者特权
    _res['isadventure'] = g.m.chongzhihdfun.isTeQuan(uid, 1)
    # 探险过期时间
    _res['tqpasstime'] = g.getAttrByCtype(uid,'chongzhi_tequan',k="1",bydate=False)
    # 周常活动 探险先锋
    _res['zchuodong'] = g.m.huodongfun.chkZCHDopen('tanxian')

    #获取已开启的活动列表
    _hdList = g.m.huodongfun.getOpenList(uid, 1)
    # 限时掉落活动id。
    _hdid = 700
    _res['isopen'] = 1 if _hdid in _hdList else 0

    return _res

#获取已领取阶段奖励的下标
def getPassPrizeIdx(uid):
    _res = []
    _data = g.getAttrOne(uid,{'ctype':'tanxian_passprizeidx'})
    if _data != None:
        _res = _data['v']
        
    return _res

#设置当天已领取的阶段奖励下标
def setPassPrizeIdx(uid,idx):
    g.setAttr(uid,{'ctype':'tanxian_passprizeidx'},{'v':idx})
    
#获取最大挂机地图id（实际挂机的最大地图）
def getMaxGjMapid(uid):
    _ctype = 'tanxian_maxgjmap'
    _res = 1
    _maxMapId = g.m.statfun.getMyStat(uid,_ctype)
    if _maxMapId != 0:
        _res = _maxMapId
        
    return _res

# 获取限时活动奖励
def getXSHDprize(prize, gjData):
    _nt = g.C.NOW()
    #获取已开启的活动列表   判断限时掉落活动是否开启
    # 限时掉落
    _xsdlHtype = 7
    # 节日掉落
    _jrdlHtype = 19
    _infos = g.mdb.find('hdinfo',{'htype':{'$in':[_xsdlHtype,_jrdlHtype]},'etime': {'$gte': _nt},'stime':{'$lte': _nt}},fields=['_id','data'])
    for _info in _infos:
        for i in xrange(len(_info['data']['arr'])):
            _xsPrize = _info['data']['arr'][i]['p']
            
            if 'cd' in _info['data']:
                #老版本的配置，cd在外层，为了兼容
                _cd = _info['data']['cd']
            else:
                _cd = _info['data']['arr'][i]['cd']
                
            _resNum = gjData // _cd
            if _resNum > 0:
                for i in _xsPrize:
                    i['n'] *= _resNum
                prize += _xsPrize
    return prize

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    # _userlist = g.mdb.find('userinfo')
    # for d in _userlist:
    #     _cc = g.C.getUUIDByDBID(str(d['_id']))
    #     _cc = '0'+_cc
    #     g.mdb.update('userinfo',{'uid':d['uid']},{'uuid':_cc})
    print getMaxTxNum(uid)
    #print getGuaJiPrize(uid,{"1":1000,'2':1000},1)