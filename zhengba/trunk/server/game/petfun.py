#!/usr/bin/python
#coding:utf-8
import g
'''
神宠相关方法
'''

# 增加雕纹
def addPet(uid, pid, num=1):
    _cInfo = {}
    _setData = [{'uid':uid,'pid':pid,'ctime':g.C.NOW(),'lv':0,} for i in xrange(num)]
    g.mdb.insert('pet',_setData)
    for i in _setData:
        _id = str(i['_id'])
        del i['_id']
        _cInfo[_id] = i

    return _cInfo

# 删除神宠
def delPet(uid, pid, num, petTid):
    _data = getPlayPet(uid)
    _pets = g.mdb.find('pet', {'uid': uid, 'pid': pid, 'lv': 0, '_id':{'$nin':map(g.mdb.toObjectId, _data.values() + [petTid])}}, limit=num)
    _pets = [pet for pet in _pets if not pet.get("lock", 0)]
    g.mdb.delete('pet', {'uid':uid, 'pid': pid, 'lv': 0, '_id': {'$in': map(lambda x:x['_id'], _pets)}})
    return {str(i['_id']): {'num': 0} for i in _pets}

# 神宠数量
def getPetInfo(uid, pid, petTid):
    _data = getPlayPet(uid)
    _pets = g.mdb.find('pet', {'uid': uid, 'pid': pid, 'lv': 0,'_id':{'$nin':map(g.mdb.toObjectId, _data.values() + [petTid])}}, fields=['_id'])
    _num = 0
    for pet in _pets:
        if pet.get("lock", 0) == 1:
            continue
        _num += 1

    return {'num': _num}

# 神宠红点
def getHongDian(uid):
    _res = {'prize':0,'fhs':0, 'crystal':0}
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        return {'pet': _res}

    _crystal = g.mdb.find1('crystal',{'uid': uid},fields=['_id']) or {}
    _nt = g.C.NOW()
    # 特权奖励
    if _crystal.get('date') != g.C.DATE(_nt) and _crystal.get('pay',0) > _nt:
        _res['prize'] = 1

    # 可以孵化
    if g.mdb.find1('itemlist',{'uid':uid,'itemid':{'$in':_con['egg'].keys()}},fields={'_id':1}):
        # 基础孵化室
        for i in xrange(1, _con['petridish'][0]+1):
            if str(i) not in _crystal.get('petridish', {}):
                _res['fhs'] = 1
                break
        else:
            # 特权孵化室
            if _crystal.get('pay',0) > _nt:
                for i in xrange(_con['petridish'][0] + 1, _con['petridish'][1] + 1):
                    if str(i) not in _crystal.get('petridish', {}):
                        _res['fhs'] = 2
    # 孵化完成
    for i in (1, _con['petridish'][1] + 1):
        i = str(i)
        if i in _crystal.get('petridish', {}) and _crystal['petridish'][i]['time']<=_nt:
            _res['fhs'] = 1

    # 水晶可以升级
    _lv = _crystal.get('crystal',{}).get('lv', 0)
    _con = g.GC['crystal']
    if str(_lv + 1) in _con and g.chkDelNeed(uid,_con[str(_lv)]['need'])['res']:
        _res['crystal'] = 1

    return {'pet': _res}

# 充值成功事件
def onChongzhiSuccess(uid, act, money, orderid, payCon):
    # 标识key
    if act not in ('chongwutequan', 'superchongwutequan'):
        return

    _time = {'chongwutequan': 7*3600*24, 'superchongwutequan': 30*3600*24}
    _con = g.GC['chongzhihd'][act]
    _data = g.mdb.find1('crystal', {'uid': uid}, fields=['_id','pay']) or {'pay': g.C.NOW()}
    g.mdb.update('crystal', {'uid': uid}, {"pay": g.C.ZERO(g.C.NOW()) + _time[act], 'paytype':_con['ctype']}, upsert=True)
    if _data['pay'] > g.C.NOW():
        g.success[orderid] = False
        return

    _prize = _con['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': act})
    g.sendUidChangeInfo(uid, _send)

# 设置出战的宠物
def setPlayPet(uid, play):
    g.mdb.update('crystal',{'uid': uid}, {'play': play}, upsert=True)
    g.mc.set('pet_play_{}'.format(uid), play, 600)

# 获取出战的宠物
def getPlayPet(uid, cache=True):
    _res = g.mc.get('pet_play_{}'.format(uid)) or {}
    if not _res and cache:
        _crystal = g.mdb.find1('crystal', {'uid': uid}, fields=['_id','play']) or {}
        _res = _crystal.get('play', {})
        g.mc.set('pet_play_{}'.format(uid), _res, 600)
    return _res

# 获取宠物出战信息
def gtPetFight(uid, side, pet=None):
    _res = []
    _pet = getPlayPet(uid) if not pet else pet
    _petData = g.mdb.find('pet', {'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _pet.values())}},fields=['lv', 'pid'])

    # 水晶数据
    _crystal = g.mdb.find1('crystal', {'uid': uid}, fields=['_id', 'crystal']) or {'crystal': {}}
    _con = g.GC['petupgrade']
    _petBuff = dict(g.GC['crystal'][str(_crystal['crystal'].get('lv', 0))]['buff'])
    _comCon = g.GC['petcom']['base']
    g.mergeDict(_petBuff, _comCon['crystalrank'][str(_crystal['crystal'].get('rank', 0))]['buff'])
    for i in _petData:
        for turn in _pet:
            if str(i['_id']) == _pet[turn]:
                i['pos'] = int(turn)
                break

        _skill = _con[i['pid']][str(i['lv'])]['skill']
        _data = {'skill': _skill, 'pid': i['pid'], 'qusan': int(_skill in _comCon['qusan']), 'pos': i['pos'],
                 'side': side}
        _data.update(_petBuff)
        _res.append(_data)
    return _res

# 获取殿堂的等级
def getPalaceLv(exp):
    _con = g.GC['petcom']['base']['palace']['data']
    _res = 0
    for i in xrange(1, len(_con) + 1):
        if exp >= _con[str(i)]['exp']:
            _res = i
        else:
            break
    return _res


# 获取水晶提供的buff
def getBuff(data):
    _buff = {}
    _con = g.GC['petcom']['base']
    for key,val in g.GC['crystal'][str(data['crystal']['lv'])]['buff'].items():
        _buff[key] = _buff.get(key, 0) + val

    for key,val in _con['crystalrank'][str(data['crystal'].get('rank', 0))]['buff'].items():
        _buff[key] = _buff.get(key, 0) + val

    _pro = _con['crystalrank'][str(data['crystal'].get('rank', 0))]['pro']
    for key in _buff:
        _buff[key] = int(_buff[key] * _pro / 1000.0)

    if data.get('palace',0) > 0:
        for key,val in g.GC['petcom']['base']['palace']['data'][str(getPalaceLv(data['palace']))]['buff'].items():
            _buff[key] = _buff.get(key, 0) + val

    return _buff



#监听充值成功事件
g.event.on("chongzhi", onChongzhiSuccess)

if __name__ == '__main__':
    # a = getPetHD(g.buid('lyf'))
    onChongzhiSuccess(g.buid('xuzhao'),'chongwutequan',1,1,1)