#!/usr/bin/python
#coding:utf-8

'''
十字军远征管理模块
'''
import g

# 获取挑战对手并且战斗格式化
def getRivalList(uid, idx, _blackList, _diff='1'):
    _maxZhanli = getMaxZhanli(uid)
    _con = g.GC['shizijun']['base']
    _rivalnum = _con['rivalnum']
    _xishuList = _con['zhanlixishu'][_diff]

    _resList = {}
    _up = int(_maxZhanli*1.1*_xishuList[idx]+500)
    _low = int(_maxZhanli*0.9*_xishuList[idx]-500)
    _w = {'maxzhanli':{'$lte':_up,'$gte':_low}}
    _rival = g.crossDB.find1_rand('jjcdefhero',_w)

    # 找不到就在取值下限找一个战力最高的
    if not _rival or _rival['uid'] in _blackList:
        _w.update({'maxzhanli':{'$lte':_low},'uid':{'$nin':_blackList}})
        _rival = g.crossDB.find1_rand('jjcdefhero',_w,sort=[['maxzhanli',-1]],limit=1)
    # 再没有就找一个机器人
    if not _rival or _rival['uid'] in _blackList:
        _npcID = getNpcByNum(uid)
        _isNpc = 1
        _rivalFightData = g.m.fightfun.getNpcFightData(_npcID)
        _headData = _rivalFightData['headdata']
        _rivalFightData = _rivalFightData['herolist']

        _data = {'headdata':_headData,'rival':_rivalFightData,'isnpc':_isNpc}
    else:
        _rivalUid = _rival['uid']
        _isNpc = 0
        _headData = _rival.get('headdata', _rival.get('head', {}))
        _rivalFightData = _rival['fightdata']
        _sName = g.m.crosscomfun.getSNameBySid(_rival['sid'])
        _zhanli = _rival['maxzhanli']

        _data = {'headdata': _headData, 'rival': _rivalFightData, 'isnpc': _isNpc,'sname':_sName,'zhanli':_zhanli}
        _blackList.append(_rivalUid)
    _resList[str(idx)] = _data
    _resList['black'] = _blackList
    return _resList


# 根据关卡获取机器人
def getNpcByNum(uid):
    gud = g.getGud(uid)
    _lv = gud['lv']
    _con = g.GC['shizijun']['base']['npc']
    for i in _con:
        _min = i[0][0]
        _max = i[0][1]
        if _min <= _lv <= _max:
            _npc = i[1]
            break
    else:
        pass

    _npcID = g.C.RANDLIST(_npc)

    return _npcID[0]




# 获取玩家最高战力
def getMaxZhanli(uid):
    gud = g.getGud(uid)
    _maxZhanli = gud.get('maxzhanli')
    if not _maxZhanli:
        _maxZhanli = 0
    return _maxZhanli

# 获取对手的防守阵容
def getFightData(uid):
    pass

# 获取跨区有竞技场备战的数据
def getCrossJjcData():
    pass

# 获取玩家已领取的奖励列表
def getPassPrizeList(uid):
    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _data:
        _res = []
    else:
        _res = _data[0]['prizelist']
    return _res

# 获取玩家通关列表
def getPassList(uid):
    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _data:
        _res = []
    else:
        _res = _data[0]['passlist']
    return _res

# 根据阵容获取上一次保存的状态
def getHerosStatus(uid):
    _ctype = 'shizijun_status'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _data:
        return {}
    return _data[0]['v']


# 记录打完后英雄的状态
def setHerosStatus(uid,data):
    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _data:
        g.setAttr(uid,{'ctype':_ctype},{'status':data})
    else:
        _data[0]['v'].update(data)
        g.setAttr(uid, {'ctype': _ctype}, {'status': _data[0]['v']})

# 根据索引获取战斗对手数据
def getRivalData(uid, _idx):
    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid, {'ctype': _ctype})
    if not _data: _rivalData = {}
    else: _rivalData = _data[0]['v'][str(_idx)]
    return _rivalData

# 使用道具
def useItem(itemid, status, tid):
    _con = g.GC['shizijun']['base']['supply'][itemid]
    if not status.get(tid):
        status[tid] = {'hp':100,'maxhp':100,'nuqi':50}
    # 魔法面包 hp 加满
    if itemid == '1':
        status[tid]['hp'] = _con['buff']['hp'] + status[tid]['hp']
        if status[tid]['hp'] > 100:
            status[tid]['hp'] = 100
    # 恶魔之血 nuqi + 200
    elif itemid == '2':
        status[tid]['nuqi'] = status[tid].get('nuqi',50) + _con['buff']['nuqi']
    # 重生十字章
    elif itemid == '3':
        status.pop(tid)

    return status


if __name__ == '__main__':
    pass