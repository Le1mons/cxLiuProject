#!/usr/bin/python
#coding:utf-8

'''
饰品管理模块
'''
import g

# 获取饰品的配置
def getShipinCon(spid=''):
    if spid:
        return g.GC['shipin'][str(spid)]
    return g.GC['shipin']


# 获取所有饰品（未穿戴的）
def getShipinList(uid, where=None,sort=None):
    _w = {'uid': uid}
    if where:
        _w.update(where)
    return g.mdb.find('shipin', _w,sort=None)


# 添加或删除饰品
def changeShipinNum(uid, spid, num=1):
    _shipin_info = getShipinInfo(uid, spid)
    _w = {'uid': uid, 'spid': spid}
    if not _shipin_info:
        _con = getShipinCon(spid)
        _num = num
        _w.update({'num': num,'color':_con['color'],'star':_con['star']})
        _addRes = g.mdb.insert('shipin',_w)
        _tid = str(_addRes)
    else:
        _tid = str(_shipin_info['_id'])
        _num = _shipin_info['num'] + num
        if _num <= 0:
            _num = 0
            g.mdb.delete('shipin', _w)
        else:
            g.mdb.update('shipin', _w, {'num': _num})

    return {_tid: {'num': _num, 'spid':spid, 'uid': uid,'tid':_tid}}



# 获取吞噬的饰品的经验值
def getTgExp(spidList):
    _exp = 0
    for spid in spidList:
        num = spidList[spid]
        _shipinCon = g.m.shipinfun.getShipinCon(spid)
        _upexp = int(_shipinCon['tgexp'])
        _exp += _upexp*num
    return _exp

# 获取饰品信息
def getShipinInfo(uid, spid, keys=''):
    _w = {'uid': uid, 'spid': spid}
    return g.mdb.find1('shipin', _w)

    
#获取饰品信息
def getShiPinData(uid,tid):
    _data = g.m.herofun.getUserwearInfo(uid, tid)
    if _data == None:
        return
    
    _spType = '5'
    if _spType not in _data:
        return
    
    _spid = _data[_spType]
    return _spid

#获取宝石buff
#tid:英雄tid
def getBuff(uid,tid):
    _buff = []
    # _spid = getShiPinData(uid,tid)
    # if _spid == None:
    #     return _buff
 
    _heroInfo = g.m.herofun.getHeroInfo(uid,tid)
    if not _heroInfo or 'weardata' not in _heroInfo or '5' not in _heroInfo['weardata']:
        return _buff

    _spid = _heroInfo['weardata']['5']
    _zhongzu = _heroInfo['zhongzu']
    _spCon = getShipinCon(_spid)
    _buff = [_spCon['buff']]
    # 种族专属buff
    if str(_zhongzu) == _spCon['zhongzu']:
        _buff.append(_spCon['zhongzubuff'])

    return _buff

if __name__ == "__main__":
    uid = g.buid("xy")
    g.debugConn.uid = uid
    print getBuff('0_5bba3516e13823215b3d01c8','5bba3ba8e13823215b3d0465')