#!/usr/bin/python
#coding:utf-8

'''
武魂模块
'''
import g

# 增加武魂
def addWuhun(uid, wid, num=1):
    _insert = []
    for i in xrange(num):
        _insert.append({
            'uid':      uid,
            'id':       wid,
            'lv':       1
        })

    g.mdb.insert('wuhun', _insert)
    _res = {}
    for i in _insert:
        del i['uid']
        _res[str(i.pop('_id'))] = i

    return _res

# 获取分解的武魂奖励
def getWuhunPrize(uid, datalist, yulan=0):
    _ids = []
    for i in datalist:
        if 'wuhun' not in i:
            continue
        _ids.append(g.mdb.toObjectId(i['wuhun']))

    _res = []
    if _ids:
        if not yulan:
            # 卸下武魂
            g.mdb.update('wuhun', {'_id': {'$in': _ids}}, {'$unset': {'wearer': 1}})

        _wuhuns = g.mdb.find('wuhun', {'_id': {'$in': _ids}}, fields=['_id', 'id'])
        for i in _wuhuns:
            _res.append({'a':'wuhun','t':i['id'],'n':1})

        if not yulan:
            g.sendUidChangeInfo(uid, {'wuhun': {str(i): {'wearer': ''} for i in _ids}})

    return g.fmtPrizeList(_res)


# 获取武魂提供的buff
def getBuff(uid, tid):
    _res = {}
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid, keys='_id,wuhun')
    if 'wuhun' not in _heroInfo:
        return _res

    _wuhun = getWuhunData(_heroInfo['wuhun'])
    _con = g.GC['wuhun'][_wuhun['id']][str(_wuhun['lv'])]
    _res.update(_con['buff'])

    for k,v in _con['exbuff'].items():
        _res[k] = _res.get(k, 0) + v

    return [_res]

# 获取武魂的数据
def getWuhunData(_id):
    _res = g.mc.get('wuhun_{0}'.format(_id))
    if not _res:
        _res = g.mdb.find1('wuhun', {'_id': g.mdb.toObjectId(_id)}, fields={'_id':0,'uid':0,'wearer':0})
        g.mc.set('wuhun_{0}'.format(_id), _res, 600)

    return _res


if __name__ == '__main__':
    uid = g.buid('0')
    a = g.getPrizeRes(uid, [{'a':'wuhun','t':'51026','n':200}])
    print a