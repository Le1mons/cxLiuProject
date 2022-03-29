#!/usr/bin/python
#coding:utf-8

'''
雕纹模块
'''
import g

# 获取雕纹信息
def getGlyphInfo(uid, gid, **kwargs):
    _w = {'_id':g.mdb.toObjectId(gid),'uid':uid}
    return g.mdb.find1('glyph',_w,**kwargs)

# 设置雕纹信息
def setGlyphInfo(uid, gid, data):
    _w = {'_id': g.mdb.toObjectId(gid), 'uid': uid}
    g.mdb.update('glyph', _w, data)

# 增加雕纹
def addglyph(uid, gid, num=1):
    _con = g.GC['glyph'][gid]
    _setData = []
    _cInfo = {}
    for i in xrange(num):
        _buff = randomBuffVal(gid)
        _data = {
            'uid':uid,
            'ctime':g.C.NOW(),
            'color':_con['color'],
            'lock':False,
            'gid':gid,
            'type':_con['type'],
            'lv':0,
        }
        _data.update(_buff)
        _setData.append(_data)
    g.mdb.insert('glyph',_setData)
    for i in _setData:
        _id = str(i['_id'])
        del i['_id']
        _cInfo[_id] = i

    # 记录曾经获得过雕文
    gud = g.getGud(uid)
    if 'isglyph' not in gud:
        gud['isglyph'] = 1
        g.gud.setGud(uid,gud)
        g.m.userfun.updateUserInfo(uid, {'isglyph': 1})
        g.sendUidChangeInfo(uid, {'attr': {'isglyph': 1}})

    return _cInfo

# 随机n条属性
def randomBuffVal(gid):
    _res = {'buff':{}}
    _con = g.GC['glyph'][gid]
    for buff in _con['buff']:
        # 基本属性
        _res['buff'][buff] = g.C.RANDINT(*_con['buff'][buff])

    # 附加属性 先随机一个库
    if _con['extbuffnum'] > 0:
        _res['extbuff'] = getRandomExtra('extbuff',_con['extbuffnum'])

    # 附加技能
    if _con['extskill'] > 0:
        _res['extskill'] = getRandomExtra('extskill', high=_con['colorlv'] >= 1)[0]
    _res['basebuff'] = _res['buff']
    return _res

# 获取随机的额外技能,buff 高级品质随机另外的ku
def getRandomExtra(_type, num=1, recast=0, high=0):
    _res = []
    _extCon = g.GC['glyphextra'][_type]
    _ku = _extCon['ku_1'] if high else _extCon['ku']
    for i in xrange(num):
        _store = g.C.RANDARR(_ku, sum(map(lambda x: x['p'], _ku)))
        # 重铸直接随机二号库
        if _type == 'extskill':
            if recast:
                _store = [i for i in _ku if i['id'] == '2'][0]
        _skills = [_extCon['id'][i] for i in _extCon['id'] if i in _store['data']]
        _skill = g.C.RANDARR(_skills, sum(i['p'] for i in _skills))
        _res.append(_skill['id'])
    return _res

# 获取洗练后的buff
def scrutinyBuff(buff, lock):
    _newBuff = getRandomExtra('extbuff', len(buff) - len(lock))
    for idx,i in enumerate(buff):
        if idx in lock:
            continue
        buff[idx] = _newBuff.pop()
    return buff

# 通过id获取buff
def getBuffById(ids):
    _res = []
    _con = g.GC['glyphextra']['extbuff']['id']
    for i in ids:
        _res.append(_con[i]['buff'])
    return _res

# 获取雕纹buff
def getGlyphBuff(uid, tid):
    _buff = []
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid, keys='_id,glyph')
    if not _heroInfo:
        return _buff

    _con = g.GC['glyphextra']['extbuff']['id']
    # 雕纹的附加属性
    for pos in _heroInfo.get('glyph', {}):
        _buff.extend(map(lambda x:_con[x]['buff'], _heroInfo['glyph'][pos]['extbuff']))

    return _buff

# 精炼雕纹
def refineGlyph(data):
    _prize = []
    _con = g.GC['glyph']
    for i in data:
        _dlzInfo = g.C.RANDARR(_con[i['gid']]['refine'], sum(map(lambda x:x['p'], _con[i['gid']]['refine'])))
        _prize.extend(g.m.diaoluofun.getGroupPrize(_dlzInfo['dlz']))
        _prize.extend(getPrizeByLv(i['lv']))

    return g.fmtPrizeList(_prize)

# 获取升级消耗的材料
def getPrizeByLv(lv):
    _prize = []
    _con = g.GC['glyphcom']['base']['lvdata']
    for i in xrange(0, lv):
        _prize.extend(_con[str(i)]['need'])
    return g.fmtPrizeList(_prize)

# 增加精炼次数
def addRefineNum(uid, num):
    g.setAttr(uid, {'ctype': 'glyph_refinenum'}, {'$inc': {'v': num}})

# 处理吞噬的buff
def handleDevoureData(hero,glyph,dGlyph,attr):
    _res = {}
    _glyphBuff = hero.get('extbuff', {}).get('glyph', [])
    # 如果有吞噬buff  处理extbuff
    if 'buff' in attr:
        if glyph['buff'] in _glyphBuff:
            _glyphBuff.remove(glyph['buff'])
        _glyphBuff.append(dGlyph['buff'])
        _res['extbuff.glyph'] = _glyphBuff
        attr.remove('buff')
    # 如果是吞噬 extbuff 或者 extskill
    for i in hero['glyph']:
        if hero['glyph'][i]['gid'] == glyph['_id']:
            for key in attr:
                hero['glyph'][i][key] = dGlyph[key]
            _res[g.C.STR('glyph.{1}', i)] = hero['glyph'][i]
            break

    return _res

# 获取雕文红点
def getGlyphHD(uid):
    return g.getAttrByCtype(uid, 'glyph_refinenum', default=0, bydate=False) >= 100




if __name__ == '__main__':
    print getRandomExtra('extskill', high=1)