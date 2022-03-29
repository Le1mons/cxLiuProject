# coding:utf-8

import g


'''
在线奖励好礼
'''
#获取配置中的奖励
def getCon():
    _con = g.GC['onlinepri']['list']
    return _con

#获取已经领取过的奖励次数
def getRecPrizeNum(uid):
    _ctype = 'onlineprize_recnum'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    if _data == None:
        return 0

    return _data['v']

#设置领取的奖励次数
def setRecPrizeNum(uid,num):
    _ctype = 'onlineprize_recnum'
    g.setAttr(uid,{'ctype':_ctype},{'v':num})

#获取在线奖励的CD
def getCD(uid):
    _ctype = 'onlineprize_cd'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    if _data == None:
        gud = g.getGud(uid)
        _ctime = gud['ctime']
        #第一次进入，默认玩家注册时间为开始时间
        _cdSize = g.GC['onlinepri']['list'][0]['cd']
        return _ctime + _cdSize
    _nt = g.C.NOW()
    _onlineTime = getOnTime(uid)
    _openTime = _data.get('opentime', _nt)

    return _data['v'] - _onlineTime + _nt

#设置下次可领取cd时间
def setCD(uid,cd):
    _ctype = 'onlineprize_cd'
    g.setAttr(uid,{'ctype':_ctype},{'v':cd})

#是否领取完毕
def getOnlineOver(uid):
    act = 1
    _hadNum = getRecPrizeNum(uid)
    _prizeNum = len(getCon())
    if _hadNum >= _prizeNum:
        act = 0

    return act


# 获取玩家当天的在线时长
# isref:强制更新
def getOnTime(uid, isref=0):
    _data = g.getAttrOne(uid, {'ctype': 'onlinetime'}, keys='_id,uid,v,lasttime')
    _nt = g.C.NOW()
    _time = 0
    if not _data:
        _lastTime = _nt
        # g.setAttr(uid, {'ctype': 'onlinetime'}, {'v': 0})
    else:
        if 'v' in _data: _time = int(_data['v'])
        _lastTime = int(_data['lasttime'])

    _disTime = _nt - _lastTime
    if isref or _disTime >= 30:
        _time = _time + 30
        g.setAttr(uid, {'ctype': 'onlinetime'}, {'v': _time})
    else:
        _time += _nt - _lastTime
        g.setAttr(uid, {'ctype': 'onlinetime'}, {'v': _time})
    return _time


#红点逻辑
def isHongDian(uid):
    _nt = g.C.NOW()
    _CD = getCD(uid)
    if _CD > _nt:
        return False

    return True


if __name__== '__main__':
    uid = g.buid('xuzhao')
    print getOnTime(uid)