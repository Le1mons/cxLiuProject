#!/usr/bin/python
#coding:utf-8

'''
装备管理模块
'''
import g
# 获取装备配置， eid为空时获取所有配置
def getEquipCon(eid=''):
    if eid:
        return g.GC['equip'][str(eid)]
    return g.GC['equip']

# 获取对应uid所有装备
def getEquipList(uid, where=None,sort=None):
    _w = {'uid': uid}
    if where:
        _w.update(where)
    #         _equipList = getEquipList(uid, {'eid': {'$in': _eids}})
    r = g.mdb.find("equiplist", _w, sort=None)
    return r

# 获取装备信息
def getEquipInfo(uid, eid, where=None):
    _w = {'uid': uid, 'eid': eid}
    if where:
        _w.update(where)
    return g.mdb.find1("equiplist", _w)

# 更新装备信息
def updateEquipInfo(uid, eid, data):
    _w = {'uid': uid, 'eid': eid}
    g.mdb.update("equiplist", _w, data)
    
    _res = g.mdb.find1('equiplist', _w)
    if not _res:
        return {}
    
    if _res.get('usenum',0)<0:
        #异常处理，防止为负
        g.mdb.update("equiplist", {"_id":_res['_id']}, {"usenum":0})
        #g.m.crosssgamelog.addLog('equipUserNumLt0_2')    
    
    _tid = str(_res['_id'])
    del _res['_id']
    return {_tid: _res}

# 改变装备的数量
def changeEquipNum(uid, eid, num):
    _equip_info = getEquipInfo(uid, eid)
    _num = _equip_info['num'] + num
    _w = {'uid': uid, 'eid': eid}
    if _num <= 0:
        g.mdb.delete('equiplist', _w)
        return {str(_equip_info['_id']): {'num': 0}}

    g.mdb.update('equiplist', _w, {'num': _num,'lasttime':g.C.NOW()})

    _data = g.mdb.find1('equiplist', _w)
    _tid = str(_data['_id'])
    del _data['_id']
    return {_tid: _data}

# 添加装备
def addEquip(uid, eid, num=1):
    _w = {'eid': eid, 'uid': uid}
    _equipInfo = getEquipInfo(uid, eid)
    if not _equipInfo:
        _equipCon = getEquipCon(eid)
        _equipInfo = {
            'color': _equipCon['color'],
            'star': _equipCon['star'],
            'type': _equipCon['type'],
            'usenum': 0,
            'num': num,
            'uid': uid,
            'eid': eid
        }
        _w.update(_equipInfo)
        _addRes = g.mdb.insert('equiplist', _w)
        _tid = str(_addRes)
    else:
        _data = {'$inc':{'num': num}}
        g.mdb.update('equiplist', _w, _data)
        _equipInfo['num'] += num
        _tid = str(_equipInfo['_id'])
        del _equipInfo['_id']
    _res = {_tid: _equipInfo}
    return _res

# 获取装备buff
def getEquipBuff(uid, tid):
    _res = {'res': False}
    _w = {'uid': uid, 'heroid': tid}
    _equips = g.mdb.find1('hero', _w)
    if not _equips:
        return _res
    _buffList = []
    _tzmap = {}
    if _equips['weardata']:
        # 计算饰品的buff
        if '5' in _equips['weardata']:
            spid = _equips['weardata']['5']
            _spCon = g.m.shipinfun.getShipinCon(spid)
            # 判断饰品的专属种族
            _spzz = _spCon['zhongzu']
            _herozz = _equips['zhongzu']
            if _spzz == _herozz:
                _buffList.append(_spCon['zhongzubuff'])
            _buffList.append(_spCon['buff'])
            del _equips['weardata']['5']

        # 计算宝石的buff
        if '6' in _equips['weardata']:
            _baoshiInfo = _equips['weardata']['6']
            _bsLv, _bsBuff = _baoshiInfo.items()[0]
            _baoshiCon = g.m.baoshifun.getBaoshiCon(_bsLv)
            _baoshiBuff = _baoshiCon['buff'][_bsBuff]
            _buffList.append(_baoshiBuff)

        _eids = _equips['weardata'].values()
        _equipList = getEquipList(uid, {'eid': {'$in': _eids}})
        for _equipInfo in _equipList:
            _equipCon = getEquipCon(_equipInfo['eid'])
            _equipBuffs = _equipCon['buff']

            # 如果tzid存在
            if _equipCon['tzid']:
                if _equipCon['tzid'] not in _tzmap:
                    _tzmap[_equipCon['tzid']] = 0
                _tzmap[_equipCon['tzid']] += 1

            _buffList.append(_equipBuffs)

        # 计算套装buff
        for tzid, v in _tzmap.items():
            _tzInfo = g.GC['equiptz'][tzid]['buff']
            v = str(v)
            if v in _tzInfo:
                _buffList.append(_tzInfo[v])

        _res['buff'] = _buffList
        _res['res'] = True

    return _res

# 获取套装配置
def getEquipTzCon(tzid):
    return g.GC['equiptz'][str(tzid)]

#获取已经穿在身上的装备信息
#tid:英雄tid
def getWearEquip(uid,tid):
    _data = g.m.herofun.getUserwearInfo(uid, tid)
    if _data == None:
        return
    
    _res = {}
    for k,v in _data.items():
        if k not in ('1','2','3','4'):
            continue
        _res[k] = v
        
    return _res
            

#获取装备buff
def getBuff(uid,tid):
    _buff = []
    _equipData = getWearEquip(uid,tid)
    if _equipData == None:
        return _buff

    _buffList = []
    #套装信息，记录套装id对应的数量
    _tzData = {}
    for pos,eid in _equipData.items():
        _tmpCon = getEquipCon(eid)
        _buffList.append(_tmpCon['buff'])
        #统计套装信息
        if _tmpCon['tzid'] != '':
            if _tmpCon['tzid'] in _tzData:
                _tzData[_tmpCon['tzid']]  += 1
            else:
                _tzData[_tmpCon['tzid']]  = 1
                
    if _tzData:
        #如果有套装信息
        for tzid,num in _tzData.items():
            _tmpCon = getEquipTzCon(tzid)
            _loopNum = num + 1
            for i in xrange(1,_loopNum):
                _ckNum = str(i)
                if _ckNum not in _tmpCon['buff']:
                    continue
            
                _buffList.append(_tmpCon['buff'][_ckNum])
            
    _buff = _buffList
    return _buff

# # 比较当前穿戴和新穿戴，获取当中最好的穿戴
# def getBestByWearData(uid, tid, _preData):
#     _res = {'shipin':{},'equip':{},'weardata':{}}
#     _con = getEquipCon()
#     # _equipList = g.mdb.find('equiplist', {'uid':uid})
#     # _shipinList = g.mdb.find('shipin',{'uid':uid}, sort=[["color",-1],['star',-1]],limit=1)
#     _wearData = {}
#     for i in xrange(1, 6):
#         i = str(i)
#         _where = {'uid': uid,'type':i}
#         eid='eid'
#         _dbName = 'equiplist'
#         if i == '5':
#             eid = 'spid'; _dbName='shipin';del _where['type']
#             _con = g.GC['shipin']
#         if i in _preData:
#             _preStar = _con[_preData[i]]['star']
#             _preColor = _con[_preData[i]]['color']
#             _where.update({'$or':[{'color':{'$gt':_preColor}},{'color':_preColor,'star':{'$gt':_preStar}}]})
#
#         _bestEquip = g.mdb.find(_dbName, _where, sort=[["color",-1],['star',-1]],limit=1)
#
#
#         # 如果不为None  就肯定比现在的装备好
#         if not _bestEquip or (i != '5' and _bestEquip[0]['usenum'] >= _bestEquip[0]['num']):
#             continue
#
#         g.m.herofun.setUserWearInfo(uid, tid, i, _bestEquip[0][eid])
#         _data = g.m.herofun.updateByUserWear(uid, tid, i, _bestEquip[0][eid])
#         if i == '5': _res['shipin'].update(_data)
#         else:_res['equip'].update(_data)
#         _wearData[i] = _bestEquip[0][eid]
#         if i in _preData:
#             preWearData = g.m.herofun.takeOffUserWear(uid, tid, i, _preData[i])
#             if i == '5':
#                 _res['shipin'].update(preWearData)
#             else:
#                 _res['equip'].update(preWearData)
#             del _preData[i]
#
#     _wearData.update(_preData)
#     _res['weardata'].update(_wearData)
#     return _res

# 比较当前穿戴和新穿戴，获取当中最好的穿戴
#tid = hero表中英雄的_id
#_preData = 当前装备，形如
#{
#    "1" : "1001"
#}

def getBestByWearData(uid, tid, _preData):
    _res = {'shipin':{},'equip':{},'weardata':{}}
    _equipList = g.mdb.find('equiplist', {'uid':uid},fields=['_id','eid','usenum','num'])
    _shipinList = g.mdb.find('shipin', {'uid':uid}, sort=[["color", -1], ['star', -1]], limit=1, fields=['_id', 'spid'])
    _temp = {str(i):[] for i in xrange(1,6)}
    _wearData = {}
    _con = getEquipCon()
    for i in _equipList:
        if i['usenum'] < i['num']:
            _temp[_con[i['eid']]['type']].append(i)
    # 计算装备
    for i in _temp:
        eid = 'eid'
        if i == '5':
            _con=g.m.shipinfun.getShipinCon()
            _temp[i] = _shipinList
            eid = 'spid'
        else:
            _con = getEquipCon()
            _temp[i].sort(key=lambda x:(_con[x['eid']]['color'],_con[x['eid']]['star']), reverse=True)
            
        if not _temp[i]:
            continue
        _bestEquip = _temp[i][0]
        
        # 如果有此类装备并且品质或者星级不如best
        # 原穿戴里有此类型 并且 eid不相等
        if i in _preData and _preData[i] != _bestEquip[eid]:
            _preColor = _con[_preData[i]]['color']
            _bestColor = _con[_bestEquip[eid]]['color']
            _preStar =  _con[_preData[i]]['star']
            _bestStar =  _con[_bestEquip[eid]]['star']

            # 原装备品质和星级没有选出来的好
            if _bestColor > _preColor or (_bestStar > _preStar and _bestColor == _preColor):
                _preWearData=g.m.herofun.takeOffUserWear(uid, tid, i, _preData[i])
                _eqData = g.m.herofun.updateByUserWear(uid, tid, i, _bestEquip[eid])
                _wearData[i] = _bestEquip[eid]
                if i == '5': _res['shipin'].update(_eqData);_res['shipin'].update(_preWearData)
                else: _res['equip'].update(_eqData);_res['equip'].update(_preWearData)
                del _preData[i]

        # 最好的装备存在  并且原穿戴里没有此类型的装备
        elif i not in _preData:
            _data = g.m.herofun.updateByUserWear(uid, tid, i, _bestEquip[eid])
            if i == '5': _res['shipin'].update(_data)
            else:_res['equip'].update(_data)
            _wearData[i] = _bestEquip[eid]

    _wearData.update(_preData)
    g.mdb.update('hero',{'_id':g.mdb.toObjectId(tid)},{'weardata':_wearData})
    _res['weardata'].update(_wearData)
    return _res

# 检查装备使用数量
def chkEquipUsenum(uid, data):
    # 暂时只检查五星装备
    if data['star'] < 5:
        return

    _useNum = g.mdb.count('hero',{'uid':uid,'weardata.{}'.format(data['type']): data['eid']})
    if _useNum == data['usenum']:
        return

    g.m.crosssgamelog.addLog('equipUserNumAdd')
    g.mdb.update('equiplist', {'uid':uid,'eid':data['eid']},{'usenum':_useNum})


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    print addEquip(uid, '3001')
