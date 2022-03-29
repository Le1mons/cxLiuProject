#!/usr/bin/python
#coding:utf-8

'''
首冲相关方法
'''

import g

#获取首冲信息
def getShouChongData(uid):
    #show:是否显示对应标签页，rec已领取的下标，chkrectime可领取的时间戳
    _res = {
        '1':{'show':1,'rec':[],'chkrectime':[]},
        '2':{'show':1,'rec':[],'chkrectime':[]},
        '3':{'show':0,'rec':[],'chkrectime':[]}
    }
    _ctype = 'shouchong_data'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    if _data != None:
        _res = _data['v']

    return _res

#设置首冲信息
def setShouChongData(uid,data):
    _ctype = 'shouchong_data'
    g.setAttr(uid,{'ctype':_ctype},data)

#首冲活动是否全部做完
def isShouChongOver(uid,iscache=1):
    _cacheKey = g.C.STR('SHOUCHONGOVER')
    _cache = g.m.sess.get(uid,_cacheKey)
    if _cache and iscache:
        return _cache

    _data = getShouChongData(uid)
    _chkData = []
    for k,v in _data.items():
        _chkData += v['rec']

    if len(_chkData) >= 9:
        #活动已经做完，一直读取缓存提高性能
        g.m.sess.set(uid,_cacheKey,1,7200)
        return 1

    return 0

#首充活动是否有
def isOpen(uid):
    act = 1
    if isShouChongOver(uid):
        act = 0
    return act


#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    _isover = isShouChongOver(uid)
    if _isover:
        #首冲活动已经做完
        return

    _signData = {}
    #累计充值金额（元）
    _con =g.GC['shouchong']
    _payNum = g.m.payfun.getAllPayYuan(uid)
    _data = getShouChongData(uid)
    _nt = g.C.NOW()
    _zeroTime = g.C.ZERO(_nt)
    for k,v in _data.items():
        if len(v['chkrectime']) > 0:
            #已经被激活过
            continue

        _chkPayNum = _con[k]['paynum']
        if _payNum < _chkPayNum:
            #重置金额不足
            continue

        if k == '3' and (len(_data['2']['chkrectime']) == 0 or _data['2']['chkrectime'][-1]> _nt):
            continue
        _signData[k] = {'show':1,'rec':[]}
        _timeArr = [_zeroTime,_zeroTime+24*3600,_zeroTime+48*3600]
        _signData[k]['chkrectime'] = _timeArr

    if len(_signData) == 0:
        return

    for k,v in _signData.items():
        _data[k] = v

    setShouChongData(uid,{'v':_data})

# 监听每日首冲
def onMeiRiShouChong(uid,act,money,orderid,payCon):
    _scData = g.getAttrByDate(uid, {'ctype': 'meirishouchong'},keys='_id,v,receive')
    _setData = {}
    if not _scData:
        _val = 0
        _setData.update({'$unset':{'receive':1}})
    else:
        if 'receive' in _scData[0]:
            return

        _val = _scData[0]['v']
    _val += int(money)
    _setData.update({'$set':{'v':_val}})
    g.setAttr(uid, {'ctype': 'meirishouchong'}, _setData)
    # 推送红点
    if _val >= g.GC['meirishouchong']['val']:
        g.m.mymq.sendAPI(uid, 'mrsc_redpoint', '1')


#监听充值成功事件
g.event.on("chongzhi",onChongzhiSuccess)
g.event.on("chongzhi",onMeiRiShouChong)


if __name__ == "__main__":
    uid = g.buid('xuzhao')
    onMeiRiShouChong(uid, 1, 48, 1, 1)
    #print onChongzhiSuccess(uid,1,1,1,1)
    # print getShiliHongDian(uid)