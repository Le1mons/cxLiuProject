#!/usr/bin/python
# coding:utf-8

if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g

'''
天梯赛
'''
# 获取赛区
def getDivision(uid=None):
    if uid is None:
        _res = g.mdb.find1('gameconfig',{'ctype':'ladder_division'},fields=['_id','v'])
        _division = _res['v'] if _res else 1
    else:
        _key = g.C.getWeekNumByTime(g.C.NOW())
        _division = g.mc.get('ladder_division_{0}_{1}'.format(_key, uid))
        if _division is None:
            _res = g.crossDB.find1('ladder',{'uid':uid,'key':_key},fields=['_id','division'])
            if _res:
                _division = _res['division']
                g.mc.set('ladder_division_{0}_{1}'.format(_key, uid), _division, 7*24*3600)
            else:
                _res = g.mdb.find1('gameconfig', {'ctype': 'ladder_division'}, fields=['_id', 'v']) or {'v': 1}
                _division = _res['v']
    return _division


# 获取对手
def getRival(uid, star, lose):
    star = min(star, g.GC['ladder']['maxstar'])
    _con = g.GC['ladder']['star'][str(star)]

    _rival = {'head':{}, 'hero':[], 'zhanli': 0}
    for i in _con['prob']:
        if g.C.RAND(100, i[0]):
            # 如果直接是npc
            if lose >= 3 or i[1]:
                for npcid in _con['npc']:
                    _rivalFightData = g.m.fightfun.getNpcFightData(npcid)
                    if not _rival['head']:
                        _rivalFightData['headdata']['lv'] = _con['npclv']
                        _nameCon = g.GC['other']['robot']
                        _rivalFightData['headdata']['name'] = ''.join(g.C.RANDLIST(_nameCon['firstname']) + g.C.RANDLIST(_nameCon['sexname']))
                        _rival['head'] = _rivalFightData['headdata']
                        _rival['head']['star'] = star
                    _rival['hero'].append(_rivalFightData['herolist'])
                    _rival['zhanli'] += _rivalFightData['zhanli']
            else:
                _mode = {1: "1v1", 3: "3v3"}[_con['mode']]
                _w = {'division':getDivision(),'key':g.C.getWeekNumByTime(g.C.NOW()),_mode:{'$exists':1},'star':{'$gte':i[3],'$lte':i[4]},'uid':{'$ne':uid}}

                if i[2] > 0:
                    _w['maxzhanli'] = {'$lte':int(g.getGud(uid)['maxzhanli'] * i[2] / 100.0)}

                _data = g.crossDB.find1_rand('ladder', _w, fields=['_id','headdata',_mode,'star','maxzhanli'])
                if not _data:
                    continue
                _rival['hero'] += _data[_mode]
                _rival['zhanli'] += _data['maxzhanli']
                _rival['head'] = _data['headdata']
                _rival['head']['star'] = _data['star']
            break

    return _rival

# 获取玩家信息
def getUserStar(uid):
    _user = g.crossDB.find('ladder', {'uid': uid}, fields={'_id': 0,'star':1,'key':1,'1v1':1,'3v3':1}, sort=[['ctime', -1]])
    _key = g.C.getWeekNumByTime(g.C.NOW())
    # 第一次  没有数据
    if not _user:
        _data = {'ttltime':g.C.TTL(),'uid':uid,'headdata':g.m.userfun.getShowHead(uid,1),'division':getDivision(),'key':_key,'star':0,'maxzhanli':g.getGud(uid)['maxzhanli'],'ctime':g.C.NOW()}
        _data['sid'] = g.getSvrIndex()
        _zypkjjc = g.mdb.find1('zypkjjc',{'uid': uid}, fields=['_id','defhero'])
        if _zypkjjc:
            _chkFightData = g.m.fightfun.chkFightData(uid, _zypkjjc['defhero'], side=1)
            if _chkFightData['chkres'] == 1:
                _data['1v1'] = [g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=_zypkjjc['defhero'].get('sqid'))]

        _zypkjjc = g.mdb.find1('championtrial',{'uid': uid}, fields=['_id','defhero'])
        if _zypkjjc:
            _hero = []
            for i in _zypkjjc['defhero']:
                _chkFightData = g.m.fightfun.chkFightData(uid, i, side=1)
                if _chkFightData['chkres'] < 1:
                    break
                _hero.append(g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=i.get('sqid')))
            if len(_hero) >= 3:
                _data['3v3'] = _hero

        g.crossDB.insert('ladder', _data)
        return 0

    # 不是本周的数据
    elif _user[0]['key'] != _key:
        _data = {'ttltime':g.C.TTL(),'uid':uid,'headdata':g.m.userfun.getShowHead(uid,1),'division':getDivision(),'key':_key,'star':0,'maxzhanli':g.getGud(uid)['maxzhanli'],'ctime':g.C.NOW()}
        _data['sid'] = g.getSvrIndex()
        if '1v1' in _user[0]:
            _data['1v1'] = _user[0]['1v1']
        if '3v3' in _user[0]:
            _data['3v3'] = _user[0]['3v3']
        g.crossDB.insert('ladder', _data)
        return 0
    else:
        return _user[0]['star']

# 红点
def getHongDian(uid):
    _res = 0
    _con = g.GC['ladder']
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or g.getGud(uid)['lv'] < _con['lv']:
        return {'ladder': _res}

    _today = g.getAttrByDate(uid, {'ctype': 'ladder_today'}) or [{'v': {}}]
    # 可以领取
    for idx,i in enumerate(_con['prize']['receive']):
        if _today[0]['v'].get('fight',0) >= i[0] and _today[0]['v'].get('win',0) >= i[1] and idx not in _today[0]['v'].get('receive',[]):
            _res = 2
            return {'ladder': _res}

    # 可以挑战
    if getEnergeNum(uid) > 0:
        _res = 1
    return {'ladder': _res}

# 获取排行奖励
def getRankPrize(star,rank,con):
    for i in con:
        if i[0] <= star <= i[1] and i[2][0] <= rank <= i[2][1]:
            return i[3]
    return []
        
# 获取精力数量
def getEnergeNum(uid, getcd=0, isset=0):
    _con = g.GC['ladder']
    _maxNum = _con['maxnum']
    _cdSize = _con['cd']
    _key = g.C.getWeekNumByTime(g.C.NOW())
    _data = g.getAttrOne(uid, {'ctype': 'ladder_energenum','k':_key}) or {'v': _con['startnum'], 'freetime':g.C.getWeekFirstDay(g.C.NOW())+_con['time'][0]}
    _nt = g.C.NOW()
    # 当前数据，且计算cd增加数量
    _before = _num = _data['v']
    _freeTime = _data['freetime']
    if _freeTime == 0:  _freeTime = _nt
    if _num < _maxNum:
        _defTime = _nt - _freeTime
        if _defTime >= _cdSize:
            _addNum = _defTime // _cdSize
            _num = _num + _addNum
            _freeTime += _addNum * _cdSize

    # 修正数据
    if _num >= _maxNum:
        if _before < _maxNum:
            _num = _maxNum
        _freeTime = 0

    # 写入数据
    if isset:
        g.setAttr(uid, {'ctype': 'ladder_energenum',}, {'v': _num, 'freetime': _freeTime, 'k':_key})

    _res = _num
    if getcd:
        # 需要cd的返回格式
        _res = {'freetime': _freeTime, 'num': _num}

    return _res


# 设置可挑战掠夺次数
def setEnergeNum(uid, addnum,ischk=1):
    _data = getEnergeNum(uid, 1, 1)
    _key = g.C.getWeekNumByTime(g.C.NOW())

    _num = _data['num']
    _cd = _data['freetime']
    _cdSize = g.GC['ladder']['cd']
    _maxLDNum = g.GC['ladder']['maxnum']
    _resNum = _num + addnum
    if ischk and _resNum < 0:
        # 不可为负数
        return

    _res = {'num': _resNum, 'freetime': _cd}
    if _resNum >= _maxLDNum:  _res['freetime'] = 0
    _setData = {'k': _key}
    _setData['v'] = _resNum
    if _cd == 0 and _resNum < _maxLDNum:
        _res['freetime'] = _setData['freetime'] = g.C.NOW()

    g.setAttr(uid, {'ctype': 'ladder_energenum'}, _setData)
    return _res


if __name__ == "__main__":
    uid = g.buid('xuzhao')
    print getDivision(uid)