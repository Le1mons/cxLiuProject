#!/usr/bin/python
# coding:utf-8


import g


# 获取英雄的配置信息
def getHeroCon(hid):
    _con = g.GC['hero']
    if not hid in _con:
        return
    return _con[hid]


# 获取实例化过的英雄配置
def getPreHeroCon(hid):
    _con = g.GC['pre_hero']
    if not hid in _con:
        return
    return _con[hid]


# 获取英雄成长配置
def getHeroGrowCon(growid):
    _con = g.GC['herogrow'][str(growid)]
    return _con


# 获取英雄通用配置
def getHeroComCon():
    return g.GC.herocom


# 获取经验上限
def getMaxLv(hid, djlv):
    if djlv <= 6:
        return g.GC['herocom']['herojinjieup'][str(djlv)]['maxlv']
    else:
        return g.GC['herostarup'][hid][str(djlv)]['maxlv']


# 添加英雄信息
# data:{'start':1|2|3|4|5,'pinzhi':1|,2......},特定的英雄属性
def addHero(uid, hid, data=None):
    hid = str(hid)
    _heroCon = getPreHeroCon(hid)
    _heroBuff = getHeroGrowCon(_heroCon['growid'])
    if _heroCon == None or _heroBuff == None:
        # 配置文件有无
        _res = {'res': False, 'act': -1}
        return _res

    _heroData = dict(_heroCon)
    _heroData['uid'] = uid
    _heroData['hid'] = hid
    # 显示星级
    _heroData['star'] = _heroCon['star']
    # 显示等阶
    _heroData['dengjie'] = 0
    # dengjielv用于升阶和升星读取配置使用
    _heroData['dengjielv'] = 0
    _heroData['lv'] = 1
    _heroData['islock'] = 0

    if type(data) == type({}):
        _heroData.update(data)
        # 如果有宝石
        if '6' in data.get('weardata', {}):
            _heroData['baoshilv'] = int(data['weardata']['6'].keys()[0])
    _calcHeroData = {}
    _calcHeroData.update(_heroData)
    # 公会科技战力
    _kejiZhanli = g.m.ghkejifun.getKeJiZhanLi(uid)
    _calcHeroData['kjzhanli'] = 0
    _job = str(_heroData['job'])
    if _job in _kejiZhanli: _calcHeroData['kjzhanli'] = _kejiZhanli[_job]
    _bzBuff = makeHeroBuff(_calcHeroData)
    _heroData.update(_bzBuff)
    _heroData['zhanli'] = _bzBuff['zhanli']  # getHeroZhanLi(_heroData)
    _heroData['lasttime'] = _heroData['ctime'] = g.C.NOW()
    _hero = g.mdb.insert('hero', g.Dict(_heroData))
    _resTid = str(_hero)
    # 记录总战力
    # _r =  g.m.statfun.setStat(uid,"HERO_SUMZHANLI",{"$inc":{"v":_heroData['zhanli']}})
    # _allZhanliData = g.m.statfun.getStatByUid(uid,"HERO_SUMZHANLI")
    # 2017-9-6 推送总战力
    '''
    gud = g.getGud(uid)
    if _allZhanliData:
        _sumZhanli = int(_allZhanliData[0]['v'])
        g.m.mymq.sendAPI(uid,"attrchange",{"sumzhanli":_sumZhanli})
        gud['sumzhanli'] = _sumZhanli
        '''
    # 检测是否更新最大战力
    _maxZhanLi = chkTopZhanli(uid, _resTid, _heroData['zhanli'])
    _res = {'res': True, "tid": _resTid, 'data': _hero, "herodata": _heroData, 'maxzhanli': _maxZhanLi}

    return _res


# 检测玩家战力排名最高的N名小兵战力总和
# tid：英雄tid
# zhanli：需要检测的小兵战力
# conn：玩家连接对象，用来同步更新推送使用
def chkTopZhanli(uid, tid, zhanli, conn=None):
    _cacheKey = 'USER_TOPZHANLIHERO'
    _data = g.m.sess.get(uid, _cacheKey)
    # 以前6名的战力在做处理
    _topNum = 6
    _resZhanli = 0
    if _data == None:
        _data = {'zhanlilist': [], 'tid2zhanli': {}}
        # 没有缓存或者不足6个小兵的情况下重新计算
        _topHero = g.mdb.find('hero', {'uid': uid}, fields=['zhanli'], sort=[["zhanli", -1]], limit=_topNum)
        for d in _topHero:
            _data['tid2zhanli'][str(d['_id'])] = d['zhanli']
            _data['zhanlilist'].append(d['zhanli'])
        g.m.sess.set(uid, _cacheKey, _data)

    if len(_data['zhanlilist']) < _topNum or zhanli > _data['zhanlilist'][-1]:
        _data['tid2zhanli'][tid] = zhanli
        _tmpOrder = g.C.dicSortByVal(_data['tid2zhanli'])
        _tmpOrder = _tmpOrder[0:_topNum]
        _data = {'zhanlilist': [], 'tid2zhanli': {}}
        for d in _tmpOrder:
            _data['tid2zhanli'][str(d[0])] = d[1]
            _data['zhanlilist'].append(d[1])

        _resZhanli = sum(_data['zhanlilist'])
        g.m.sess.set(uid, _cacheKey, _data)

    # 为0时不更新战力
    return _resZhanli


# 获取英雄开启被动技能的数量
def _getHeroBDskillNum(hid, dengjielv):
    _heroCon = getHeroCon(hid)
    _openCon = list(_heroCon['bdskillopendjlv'])
    _maxNum = len(_openCon)
    if _maxNum == 0:
        return 0

    _res = 0
    for chkdj in _openCon:
        if chkdj > dengjielv:
            break
        _res += 1

    return _res


# 获取开放的被动技能-传入uid处理特殊逻辑特殊
def getOpenBDSkill(uid, hero):
    _skill = getOpenBDSkillByHeroData(hero)
    return _skill


# 获取开放的被动技能
def getOpenBDSkillByHeroData(hero):
    _skill = []
    _hid = str(hero['hid'])
    _dengjieLv = hero['dengjielv']
    _heroCon = getHeroCon(_hid)
    # 开启的被动技能个数
    _bdskillNum = _getHeroBDskillNum(_hid, _dengjieLv)
    if _bdskillNum > 0:
        _loopNum = _bdskillNum + 1
        for i in xrange(1, _loopNum):
            _key = g.C.STR('bd{1}skill', i)
            _skill += hero[_key]

    return _skill


# 获取被动技能面板buff
def getBDSkillBuff(uid, tid):
    _buff = []
    _hero = getHeroInfo(uid, tid)
    _skill = getOpenBDSkill(uid, _hero)
    # 加上雕纹的技能
    _con = g.GC['glyphextra']['extskill']['id']
    _skill += list(set([_con[_hero['glyph'][x]['extskill']]['skillid'][0] for x in _hero.get('glyph',{}) if 'extskill' in _hero['glyph'][x]]))
    _con = g.GC.skill
    for bid in _skill:
        skill = _con[bid]
        _attr = str(skill['type'])
        if _attr != '1':
            continue

        _buff.append({skill['attr']: skill['v']})

    return _buff


# 计算英雄的属性buff
def makeHeroBuff(herodata, extbuff=None):
    _hid = str(herodata['hid'])
    _heroCon = getHeroCon(_hid)
    # 成长id
    _growid = str(_heroCon['growid'])
    # 基础属性值
    _lv = herodata['lv']
    _dengjielv = herodata['dengjielv']
    _kjZhanli = herodata.get('kjzhanli', 0)
    _tyZhanli = herodata.get('tyzhanli', 0)
    _jwZhanli = herodata.get('titlezhanli', 0)
    _growCon = g.GC['herogrow'][_growid]
    _tmpBuff = dict(g.GC['table']['herobuff'])
    if _dengjielv > 6:
        # 升级配置

        _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]

        _tmpBuff['xpskill'] = _djBuffCon['xpskill']
        _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
        _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
        _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']
    else:
        # 进阶配置
        _djBuffCon = g.GC.herocom['herojinjieup'][str(_dengjielv)]
        _tmpBuff['xpskill'] = herodata['xpskill']
        _tmpBuff['bd1skill'] = herodata['bd1skill']
        _tmpBuff['bd2skill'] = herodata['bd2skill']
        _tmpBuff['bd3skill'] = herodata['bd3skill']

    # 雕纹提供的star属性
    _starBuff = {}
    for i in ('staratkpro', 'starhppro'):
        _starBuff[i] = herodata.get(i, 1000)
        _tmpBuff[i] = herodata.get(i, 1000)

    if 'herobuff' in herodata and 'glyph' in herodata['herobuff'] and len(herodata['herobuff']['glyph']) > 0:
        for d in herodata['herobuff']['glyph']:
            for k, v in d.items():
                if k not in ('staratkpro', 'starhppro'):
                    continue
                _starBuff[k] += v

    # 基础属性
    _baseAtk = (_growCon['atk'] + (_lv - 1) * _growCon['atk_grow']) * _djBuffCon['atkpro'] * (_starBuff['staratkpro'] * 0.001)
    _baseDef = (_growCon['def'] + (_lv - 1) * _growCon['def_grow']) * _djBuffCon['defpro']
    _baseHp = (_growCon['hp'] + (_lv - 1) * _growCon['hp_grow']) * _djBuffCon['hppro'] * (_starBuff['starhppro'] * 0.001)
    _baseSpeed = (_growCon['speed'] + (_lv - 1) * _growCon['speed_grow']) * _djBuffCon['speedpro']
    _tmpBuff['atk'] = _baseAtk
    _tmpBuff['def'] = _baseDef
    _tmpBuff['hp'] = _baseHp
    _tmpBuff['speed'] = _baseSpeed

    # 天命的buff 和 skin buff 和 爵位buff 称号buff 一起算
    _commonBuff = herodata.get('commonbuff', {})
    _chExtBuff = []
    # 装备属性
    _itemVal = {'atk': 0, 'def': 0, 'hp': 0, 'atkpro': 1000, 'defpro': 1000, 'hppro': 1000}
    if any([
        set(_commonBuff.keys()) & {'destiny','title','chenghao','jiban','exhibition','meltsoul', 'mjhj'},
        'skin' in herodata and (herodata['skin']['expire'] == -1 or herodata['skin']['expire'] > g.C.NOW()),'extbuff' in herodata
    ]):
        _destinyBuff = {}
        for i in _commonBuff.get('destiny', []):
            for key in i:
                _destinyBuff[key] = _destinyBuff.get(key, 0) + i[key]
        if 'skin' in herodata and (herodata['skin']['expire'] == -1 or herodata['skin']['expire'] > g.C.NOW()):
            for key, val in g.GC['accessories'][str(herodata['skin']['sid'])]['buff'].items():
                _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                _itemVal[key] = _itemVal.get(key, 0) + val
        # 计算封爵buff
        for i in _commonBuff.get('title', {}):
            for key, val in i.items():
                if key in g.GC['herocom']['multiplykey']:
                    _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                else:
                    _chExtBuff.append({key: val})

        # 计算封爵buff
        for i in _commonBuff.get('exhibition', []):
            for key, val in i.items():
                if key in g.GC['herocom']['multiplykey']:
                    _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                else:
                    _chExtBuff.append({key: val})

        # 计算称号buff
        for i in _commonBuff.get('chenghao', []):
            for key,val in i.items():
                if key in g.GC['herocom']['multiplykey']:
                    _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                else:
                    _chExtBuff.append({key: val})

        # 计算武魂buff
        for btype, i in herodata.get('extbuff', {}).items():
            if btype not in ('wuhun',):
                continue
            for x in i:
                for key,val in x.items():
                    if key in g.GC['herocom']['multiplykey']:
                        _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                    else:
                        _chExtBuff.append({key: val})

        # 计算融魂觉醒buff
        for i in _commonBuff.get('meltsoul', []):
            for key,val in i.items():
                if key in g.GC['herocom']['multiplykey']:
                    _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                else:
                    _chExtBuff.append({key: val})

        # 计算名将绘卷buff
        for key, val in _commonBuff.get('mjhj', {}).items():
            if key in g.GC['herocom']['multiplykey']:
                _destinyBuff[key] = _destinyBuff.get(key, 0) + val
            else:
                _chExtBuff.append({key: val})



        _plid = str(_heroCon['pinglunid'])
        # 计算羁绊buff
        for plid in _commonBuff.get('jiban', {}):
            if _plid != plid:
                continue
            for key,val in _commonBuff["jiban"][plid].items():
                if key in g.GC['herocom']['multiplykey']:
                    _destinyBuff[key] = _destinyBuff.get(key, 0) + val
                else:
                    _chExtBuff.append({key: val})


        herodata['commonbuff'] = _commonBuff = _commonBuff.copy()
        _commonBuff['destiny'] = [{i: _destinyBuff[i]} for i in _destinyBuff]
        if 'extbuff' in herodata:
            herodata['extbuff']['chenghao'] = _chExtBuff
        else:
            herodata['extbuff'] = {'chenghao': _chExtBuff}

    # #英雄的公用buff
    _job = str(herodata['job'])
    if 'commonbuff' in herodata:
        for k in herodata['commonbuff']:

            if k == 'keji':
                _commonBuff = herodata['commonbuff'][k]
                if _job not in _commonBuff:
                    continue
                _commonBuff = _commonBuff[_job]


            elif k in ('enchant', 'artifact', 'chenghao', 'title', 'crystal', "jiban", "exhibition", "meltsoul", "mjhj"):
                continue
            # 2019.7.11  天命buff和皮肤的buff一起算
            # elif k == 'destiny':
            #     continue
            else:
                _commonBuff = herodata['commonbuff'][k]



            for cbuff in _commonBuff:
                for bufKey, bufVal in cbuff.items():
                    if bufKey in g.GC['herocom']['multiplykey']:
                        if _tmpBuff[bufKey] == 0:
                            _tmpBuff[bufKey] = bufVal
                        else:
                            _tmpBuff[bufKey] *= (1.0 + bufVal * 0.001)
                    else:
                        _tmpBuff[bufKey] += bufVal

    # 根据英雄获取的buff
    if 'herobuff' in herodata:
        for k, bufflist in herodata['herobuff'].items():
            if len(bufflist) == 0:
                continue
            for buff in bufflist:
                for bufKey, bufVal in buff.items():
                    if bufKey in ('staratkpro', 'starhppro'):
                        continue
                    if bufKey in g.GC['herocom']['multiplykey']:
                        if _tmpBuff[bufKey] == 0:
                            _tmpBuff[bufKey] = bufVal
                        else:
                            _tmpBuff[bufKey] *= (1.0 + bufVal * 0.001)
                    else:
                        _tmpBuff[bufKey] += bufVal

    # 如果有额外计算的buff
    if extbuff:
        for bufKey, bufVal in extbuff.items():
            if bufKey in g.GC['herocom']['multiplykey']:
                if _tmpBuff[bufKey] == 0:
                    _tmpBuff[bufKey] = bufVal
                else:
                    _tmpBuff[bufKey] *= (1.0 + bufVal * 0.001)
            else:
                _tmpBuff[bufKey] += bufVal

        
    # 乘法加成取整
    for mkey in g.GC['herocom']['multiplykey']:
        _tmpBuff[mkey] = int(_tmpBuff[mkey])

    _tmpBuff['atk'] = int(_tmpBuff['atk'] * (_tmpBuff['atkpro'] * 0.001))
    _tmpBuff['def'] = int(_tmpBuff['def'] * (_tmpBuff['defpro'] * 0.001))
    _tmpBuff['hp'] = int(_tmpBuff['hp'] * (_tmpBuff['hppro'] * 0.001))
    _tmpBuff['speed'] = int(_tmpBuff['speed'] * (_tmpBuff['speedpro'] * 0.001))


    if 'herobuff' in herodata and 'equip' in herodata['herobuff'] and len(herodata['herobuff']['equip']) > 0:
        for d in herodata['herobuff']['equip']:
            for k, v in d.items():
                if k not in _itemVal:
                    continue
                if k in g.GC['herocom']['multiplykey']:
                    _itemVal[k] *= (1.0 + v * 0.001)
                else:
                    _itemVal[k] += v

    # 计算融魂属性 不参与百分比计算
    _extBuff = {}
    if 'extbuff' in herodata:
        for k, bufflist in herodata['extbuff'].items():
            if len(bufflist) == 0 or k in ('wuhun',):
                continue
            for buff in bufflist:
                for bufKey, bufVal in buff.items():
                    _extBuff[bufKey] = _extBuff.get(bufKey, 0) + bufVal
                    _tmpBuff[bufKey] += bufVal

    # 取出commonbuff里的附魔buff
    # if _job in herodata.get('commonbuff',{}).get('enchant',{}):
    #     for _type, bufflist in herodata['commonbuff']['enchant'][_job].items():
    #         # 只有穿戴了对应类型的hero
    #         if _type not in herodata.get('weardata', {}):
    #             continue
    #         for buf in bufflist:
    #             for bufKey, bufVal in buf.items():
    #                 _extBuff[bufKey] = _extBuff.get(bufKey, 0) + bufVal
    #                 _tmpBuff[bufKey] += bufVal

    if 'commonbuff' in herodata:
        for k in herodata['commonbuff']:
            if k == 'artifact':
                _commonBuff = herodata['commonbuff'][k].values()
            elif k == 'crystal':
                _commonBuff = herodata['commonbuff'][k]
            # 符合职业
            elif k == 'enchant':
                for _type, bufflist in herodata['commonbuff']['enchant'].items():
                    # 只有穿戴了对应类型的装备
                    if _type not in herodata.get('weardata', {}):
                        continue
                    for buf in bufflist:
                        for bufKey, bufVal in buf.items():
                            _extBuff[bufKey] = _extBuff.get(bufKey, 0) + bufVal
                            _tmpBuff[bufKey] += bufVal
                continue
            else:
                continue

            for cbuff in _commonBuff:
                for bufKey, bufVal in cbuff.items():
                    if bufKey in g.GC['herocom']['multiplykey']:
                        if _tmpBuff[bufKey] == 0:
                            _tmpBuff[bufKey] = bufVal
                        else:
                            _tmpBuff[bufKey] *= (1.0 + bufVal * 0.001)
                    else:
                        _extBuff[bufKey] = _extBuff.get(bufKey, 0) + bufVal
                        _tmpBuff[bufKey] += bufVal

    # 战力计算
    # 基础攻击：英雄成长表配置的攻击（herogrow）
    # 攻击成长：英雄成长表配置的成长值（herogrow）
    # 攻击阶位加成：等阶或星级的加成（herocom或herostarup）
    # A1：（（基础攻击+（lv-1）*攻击成长）*攻击阶位加成+装备固定攻击）*装备攻击百分比
    _A1 = (_baseAtk + _itemVal['atk']) * _itemVal['atkpro'] * 0.001 + _extBuff.get('atk', 0)
    # B1：（基础防御+（lv-1）*防御成长）*防御阶位加成
    _B1 = _baseDef + _extBuff.get('def', 0)
    # C1：（（基础生命+（lv-1）*生命成长）*生命阶位加成+装备固定生命）*装备生命百分比/6
    _C1 = ((_baseHp + _itemVal['hp']) * _itemVal['hppro'] * 0.001) / 6 + _extBuff.get('hp', 0) / 6
    # 其他：宝石战力+饰品战力+所属职业公会技能战力
    # 宝石战力
    _bsZhanLi = 0
    if 'weardata' in herodata and '6' in herodata['weardata']:
        _bsZhanLi = g.GC['baoshi'][herodata['weardata']['6'].keys()[0]]['zhanli']
        if "baoshijinglian" in herodata:
            _bsZhanLi += g.GC["baoshijinglian"][str(herodata['weardata']['6'].values()[0])][str(herodata["baoshijinglian"])]["zhanli"]

    # 饰品战力
    _spZhanLi = 0
    if 'weardata' in herodata and '5' in herodata['weardata']:
        _spZhanLi = g.m.shipinfun.getShipinCon(str(herodata['weardata']['5']))['zhanli']

    # 所属职业公会技能战力
    _ghZhanLi = 0
    # 战力 = A1 + B1 + C1 + 其他
    _zhanli = int(_A1 + _B1 + _C1 + _bsZhanLi + _spZhanLi + _ghZhanLi + _kjZhanli+_tyZhanli+_jwZhanli)
    _tmpBuff['zhanli'] = _zhanli
    return _tmpBuff

# 获取我已经拥有的英雄列表
def getMyHeroList(uid, keys='', where=None, sort=None, limit=None):
    _options = {}
    if keys != '':
        _options['fields'] = keys.split(",")

    _w = {"uid": uid}
    if where != None:
        _w.update(where)

    if sort != None: _options['sort'] = sort
    if limit != None: _options['limit'] = limit
    _heroList = g.mdb.find("hero", _w, **_options)
    return _heroList


# 设置某一个英雄的buff
def setBuffByTid(uid, tid, buff):
    _w = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    g.mdb.update('hero', _w, buff)


# 重置英雄buff
# tid:英雄唯一标识
# keys:重置buff类型-['baoshi','shipin'] 或 'baoshi'
def reSetHeroBuff(uid, tid, keys=None, buffkey='herobuff'):
    _actFun = {
        'baoshi': {"func":g.m.baoshifun.getBuff,"key":"herobuff"},  # 宝石
        'shipin': {"func":g.m.shipinfun.getBuff,"key":"herobuff"},  # 饰品
        'equip': {"func":g.m.equipfun.getBuff,"key":"herobuff"},  # 装备
        'bdskillbuff': {"func":getBDSkillBuff,"key":"herobuff"},  # 被动buff
        'glyph': {"func":g.m.glyphfun.getGlyphBuff,"key":"herobuff"},  # 雕纹buff
        'wuhun': {"func":g.m.wuhunfun.getBuff,"key":"extbuff"},  # 武魂buff
    }
    '''
    检测消耗英雄是否返还奖励
    肯定要重算战力 先 raise error 确定后再增加key
    '''
    if keys and isinstance(keys, list) and set(keys) - {'baoshi','shipin','equip','bdskillbuff','herobase','glyph','wuhun'}:
        raise ValueError("hero breakdown cost prize!!!!!!!!!!!!!!!!")

    _reSetKeys = []
    if keys == None:
        _reSetKeys = _actFun.keys()
    else:
        _reSetKeys = [keys]
        if type(keys) == type([]): _reSetKeys = keys

    # 如果是英雄基础属性修改，则不重置其他任何buff
    if 'herobase' not in _reSetKeys:
        _setData = {}
        for k in _reSetKeys:
            if k not in _actFun:
                continue
            _key = '{0}.{1}'.format(_actFun[k]['key'], k)
            _tmpBuff = _actFun[k]['func'](uid, tid)
            _setData[_key] = _tmpBuff

        # 设置herobuff
        setBuffByTid(uid, tid, _setData)

    _hero = getHeroInfo(uid, tid)
    _r = _reSetHerosBuff(uid, [_hero])
    return _r


# 重新计算所有卡牌属性
def reSetAllHeroBuff(uid, where=None):
    _heros = getMyHeroList(uid, where=where)
    if len(_heros) > 0:
        return _reSetHerosBuff(uid, _heros)
    return {}


# 根据type获取下一级的属性， 如果type是None 就获取当前等级的属性
def caleHeroBuff(uid, heroinfo):
    _hero = heroinfo
    _r = _reSetHerosBuff(uid, [_hero], 0)
    return _r


# 重置英雄buff
# tidlist:需要更新英雄的tid列表
# 重算后是否写入数据库
def _reSetHerosBuff(uid, herolist, isset=1, extbuff=None):
    _commonBuff = g.m.userfun.getCommonBuff(uid)
    # 公会科技战力
    _kejiZhanli = g.m.ghkejifun.getKeJiZhanLi(uid)

    _tyZhanli = getDestinyData(g.getGud(uid).get('destiny',0))['zhanli']
    # 爵位战力
    _titlezhanli = g.GC['title'][str(g.getGud(uid)['title'])]['zhanli']
    _maxZhanli = 0  # 变化的英雄中最高战力值是多少
    _maxZhanliHero = None
    _hasZhanliUp = False  # 是否有任何一个英雄的战力提升了
    res = {}
    # 用来计算最高战力的变量
    _tid2HeroZhanli = {}
    for _hero in herolist:
        _job = str(_hero['job'])
        _hero['commonbuff'] = _commonBuff
        _hero['kjzhanli'] = 0
        _hero['tyzhanli'] = _tyZhanli
        _hero['titlezhanli'] = _titlezhanli
        if _job in _kejiZhanli:
            _hero['kjzhanli'] = _kejiZhanli[_job]

        _heroData = {}
        _buff = makeHeroBuff(_hero, extbuff=extbuff)
        _heroData.update(_buff)
        _heroData['uid'] = uid
        _heroData['hid'] = _hero['hid']
        _heroData['zhanli'] = _buff['zhanli']  # getHeroZhanLi(_heroData)
        '''
        if _heroData['zhanli'] > _maxZhanli:
            _maxZhanli = _heroData['zhanli']
            _maxZhanliHero = _hero
        '''

        # 战力差值
        _diffZhanli = _heroData["zhanli"] - _hero["zhanli"]
        if _diffZhanli > 0: _hasZhanliUp = True

        # 修改英雄属性
        _tid = str(_hero['_id'])
        del _heroData['uid']
        # del _heroData['hid']
        if isset:
            updateHero(uid, _tid, _heroData)

        res[_tid] = _heroData
        _tid2HeroZhanli[_tid] = _heroData['zhanli']

    if len(_tid2HeroZhanli) > 6:
        # 检测最高战力大于6个英雄时，只取战力最高的6个英雄
        _tmpData = g.C.dicSortByVal(_tid2HeroZhanli)
        _tid2HeroZhanli = {}
        for d in _tmpData:
            _tid2HeroZhanli[d[0]] = d[1]

    for k, v in _tid2HeroZhanli.items():
        _tmpZhanli = chkTopZhanli(uid, k, v)
        if _tmpZhanli != 0:
            _maxZhanli = _tmpZhanli

    # 设置最大战力
    if isset:
        g.m.userfun.setMaxZhanli(uid, _maxZhanli)

    return res


# 获取英雄的战力
def getHeroZhanLi(buff):
    # print 'buff========',buff
    # 基础攻击：英雄成长表配置的攻击（herogroupup）
    # 攻击成长：英雄成长表配置的成长值（herogroupup）
    # 攻击阶位加成：等阶或星级的加成（herocom或herostarup）
    # A1：（（基础攻击+（lv-1）*攻击成长）*攻击阶位加成+装备固定攻击）*装备攻击百分比
    # B1：（基础防御+（lv-1）*防御成长）*防御阶位加成
    # C1：（（基础生命+（lv-1）*生命成长）*生命阶位加成+装备固定生命）*装备生命百分比/6
    # 其他：宝石战力+饰品战力+所属职业公会技能战力
    # 战力 = A1 + B1 + C1 + 其他
    _zl = buff['atk'] + buff['def'] + buff['hp']/6 + buff['speed']
    return _zl


# 设置英雄buff
def getHeroBuff(uid, hid, keys=""):
    hero = {}
    return hero


# 获取穿戴的装备信息
# strict = 是否严格模式，主要用于当英雄不存在时 返回False，而不是None
# 但是这个方法很多地方用过，不确定False是否对逻辑有影响，固新增了一个参数来确定返回值
def getUserwearInfo(uid, herotid, strict=False):
    _w = {'uid': uid, '_id': g.mdb.toObjectId(herotid)}
    _wearInfo = g.mdb.find1('hero', _w, fields=['weardata'])
    if _wearInfo == None:
        if strict:
            return False
        return  # 这行是原有的逻辑，隐性返回了None

    return _wearInfo.get('weardata')


# 设置穿戴装备
# _type:穿戴类型 1234装备，5饰品，6宝石
def setUserWearInfo(uid, herotid, _type='', eqid='', data=None):
    _w = {'uid': uid, '_id': g.mdb.toObjectId(herotid)}
    _key = g.C.STR('weardata.{1}', _type)
    _data = {_key: eqid}
    # 如果data为True 直接设置到数据库
    if data: _data = {'weardata': data}
    if _type == '6':
        _data.update({'baoshilv': int(eqid.keys()[0])})
    g.mdb.update("hero", _w, _data, upsert=True)

    _wearData = g.mdb.find1('hero', _w)['weardata']
    return {'weardata': _wearData}


# 通过穿戴信息更改数据库
def updateByUserWear(uid, herotid, _type='', eqid=''):
    # 穿戴饰品
    if _type == '5':
        _data = g.m.shipinfun.changeShipinNum(uid, eqid, -1)
    # 穿戴普通装备
    else:
        _w = {'uid': uid, 'eid': eqid}
        _equipInfo = g.mdb.find1('equiplist', _w)
        if _equipInfo:
            # 确保即便有多条数据，也不会更新错，并且只按需更新最少字段
            _equipInfo['usenum'] += 1
            g.mdb.update('equiplist', {"_id": _equipInfo['_id']}, {"usenum": _equipInfo['usenum']})
            _tid = str(_equipInfo['_id'])
            del _equipInfo['_id']

            _data = {_tid: _equipInfo}
        else:
            _data = {}

    return _data


# 脱下装备
def takeOffUserWear(uid, herotid, _type, eqid):
    _w = {'uid': uid, '_id': g.mdb.toObjectId(herotid)}
    data = {'$unset': {'weardata.{}'.format(_type): eqid}}
    _r = g.mdb.update('hero', _w, data)

    if _type == '5':
        _data = g.m.shipinfun.changeShipinNum(uid, eqid, 1)
    # 数据修改不成功
    elif _r['nModified'] != 1:
        g.m.crosssgamelog.addLog('equipUserNumErr')
        return {}
    else:
        _eqInfo = g.m.equipfun.getEquipInfo(uid, eqid)
        if not _eqInfo:
            # 如果装备已不存在
            return {}

        if _eqInfo['usenum'] < 0:
            # 异常处理，防止为负
            _eqInfo['usenum'] = 0
            g.m.crosssgamelog.addLog('equipUserNumLt0', {"uid": uid, "herotid": herotid, "type": _type, "eqid": eqid})

        _r = g.mdb.update('equiplist', {"_id": _eqInfo['_id'],'usenum':_eqInfo['usenum']}, {'usenum': _eqInfo['usenum'] - 1})
        _eqInfo['usenum'] -= 1
        # 更新不成功 检查装备数量
        if _r['updatedExisting'] == False:
            _eqInfo['usenum'] = g.m.equipfun.chkEquipUsenum(uid,_eqInfo,0)

        _tid = str(_eqInfo['_id'])
        del _eqInfo['_id']
        _data = {_tid: _eqInfo}

    return _data


# 获取英雄详细信息
def getHeroInfo(uid, tid, keys=''):
    _where = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    _options = {}
    if keys != '':
        _options['fields'] = keys.split(",")
    _hero = g.mdb.find1('hero', where=_where, **_options)
    return _hero


# 获取英雄当前等级的经验上限
def getMaxExp(lv):
    # 将领经验=100*(1+INT(将领等级/10)^3.1)
    # _maxExp = 100*int(1+pow(int(lv*0.1),3.1))
    # if lv >= 30:_maxExp = int(_maxExp * 0.001) *1000
    _lv = str(lv)
    if _lv not in g.GC['herocom']['herolvup']:
        return 999999999
    _con = g.GC['herocom']['herolvup'][_lv]
    return _con['maxexp']


# 修改玩家经验
def altExp(uid, hid, exp):
    _exp = exp
    '''
    #世界等级加成
    _wlv2Pro = g.getWorldLvExtPro(uid)
    if 'heroexppro' in _wlv2Pro:
        _exp = int((1.0+_wlv2Pro['heroexppro']) * exp)
    '''

    _hero = getHeroInfo(uid, hid)
    _djlv = _hero['dengjielv']
    gud = g.getGud(uid)
    _userLv = int(gud['lv'])
    _baselv = _lv = int(_hero['lv'])
    _myexp = _hero['nexp'] + int(_exp)
    _res = {}
    _maxExp = getMaxExp(_djlv)
    while (1):
        # if _myexp >= _maxExp and (_lv <20 or _lv < _userLv):
        if _myexp >= _maxExp:
            _lv += 1
            _myexp = _myexp - _maxExp
        else:
            break

    # print "_baselv",_baselv
    # print "_lv",_lv
    _isUp = 0
    _res['nexp'] = _myexp
    if _myexp > _maxExp: _res['nexp'] = _maxExp - 1
    if _lv != int(_baselv): _isUp = 1
    if _isUp:
        _res['lv'] = _lv
        # _res['maxexp'] = _maxExp
        # 将领等级提升事件
        # g.event.emit("herochange",uid,"HGYM")

    return _res


# 修改英雄信息
def updateHero(uid, tid, data):
    _data = g.Dict(data)
    _data['lasttime'] = g.C.NOW()
    # if 'maxexp' in _data: del(_data['maxexp'])
    _where = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    _res = g.mdb.update('hero', _where, data)
    return _res


# 获取分解英雄的奖励
# datalist增加了去重处理，防止上层逻辑上错误的传过来的重复的英雄
# 导致equip等被还多次
def getFenjiePrize(uid, datalist, isfenjie=True, isyulan=False):
    _res = {'prize': [], 'shipin': [], 'equip': []}
    _ids = {}
    # 记录融魂的消耗
    _msLog = {}
    _delList = []
    for data in datalist:
        # 如果有id的话，先去重
        _id = str(data.get('_id', ""))
        if _id != "":
            if _id in _ids:
                g.m.crosssgamelog.addLog('repeatHeroInFenJie', datalist)
                continue
            _ids[_id] = 1

        _weardata = data.get('weardata')
        # 获取升级得的培养材料
        _lvPrize = getHcPrizeByType('lv', data)
        # 获取升阶的培养材料
        _dengjiePrize = getHcPrizeByType('dengjie', data)
        # 加上初始星级返还的材料
        # 融魂消耗的材料
        _msPrize = g.getAttrByCtype(uid, 'meltsoul_cost', bydate=False, default=[], k=str(data['_id']))
        if _msPrize:
            _msLog[str(data['_id'])] = _msPrize
        _delList.append(str(data['_id']))
        _starCon = g.GC['herocom']['star2back']

        if isfenjie:
            _star = str(data['star']) if data['star'] <= 6 else '6'
            _prize = _starCon.get(_star, [])
            _res['prize'] += _prize

        _res['prize'] += (_lvPrize + _dengjiePrize + _msPrize)
        if _weardata:
            # 脱下装备并且获取宝石升级的消耗
            _baoshiPrize = getFenjieEquip(uid, _weardata)
            _res['prize'] += _baoshiPrize['prize']
            _res['equip'] += _baoshiPrize['equip']
            _res['shipin'] += _baoshiPrize['shipin']

        # 有精炼
        if "baoshijinglian" in data and _weardata:
            # 获取宝石精炼等级
            _jinglianCon = g.GC["baoshijinglian"]
            _jinglian = data.get("baoshijinglian", 0)
            # 容错处理
            if "6" in _weardata:
                _baoshiBuffNum = _weardata["6"].values()[0]
                for jllv in xrange(_jinglian):
                    _res['prize'].extend(_jinglianCon[str(_baoshiBuffNum)][str(jllv)]["need"])



    _res['prize'] = g.fmtPrizeList(_res['prize'])
    if not isyulan:
        # 删除分解后的数据
        g.mdb.delete('playattr', {'uid': uid, 'ctype': 'meltsoul_cost', 'k': {'$in': _delList}})
        g.m.dball.writeLog(uid, 'meltsoul_cost', {'hero':datalist,'prize':_msLog})

    _res['wuhun'] = g.m.wuhunfun.getWuhunPrize(uid, datalist, isyulan)
    return _res


# 根据等级获取合成分解英雄的奖励
def getHcPrizeByType(_type, data):
    _res = []
    _heroCon = getHeroComCon()
    if _type == 'lv':
        lv = data['lv']
        _con = _heroCon['herolvup']
        _start = 1
    elif _type == 'dengjie':
        lv = data['dengjie']
        _start = 0
        _con = _heroCon['herojinjieup']
    else:
        return _res

    for i in xrange(_start, lv):
        _need = _con[str(i)]['need']
        _res += _need
    # 如果是等级就加上经验
    if _type == 'lv' and _res:
        _exp = sum(map(lambda i: _con[str(i)]['maxexp'], xrange(1, lv)))
        _res += [{'a': 'attr', 't': 'useexp', 'n': _exp}]
    return _res


# 获取分解英雄的装备奖励
def getFenjieEquip(uid, data):
    _res = {'prize': [], "shipin": [], 'equip': []}
    for _type, eid in data.items():
        if _type == '6':
            for i in xrange(1, int(eid.keys()[0])):
                _need = g.m.baoshifun.getBaoshiCon(str(i))['lvupneed']
                _res['prize'] += [x for x in _need if x['t'] != 'jinbi']
        elif _type == '5':
            # _data = g.m.shipinfun.changeShipinNum(uid,eid,1)
            _res["shipin"].append({'a': 'shipin', 't': eid, 'n': 1})
        else:
            # g.m.equipfun.updateEquipInfo(uid, eid, {'$inc':{'usenum': -1}})
            _res['equip'].append({'a': 'equip', 't': eid, 'n': 1})
    return _res


# 获取某个英雄显示信息
def getHeroShowInfo(uid):
    pass


# 重新计算英雄buff
def onChangeHeroBuff(uid, oldvip, newvip):
    _chkLv = 14
    if newvip < _chkLv:
        return
    reSetAllHeroBuff(uid)
    g.m.mymq.sendAPI(uid, "attrchange", {"vip": newvip})


# 检查升星吞噬的英雄
def chkHero(uid, _hero_info, _extneeds, _tidDict):
    _res = {'res': True, 'herolist': []}
    for idx, _tidList in _tidDict.items():
        _num = _extneeds[int(idx)]['num']
        _where = {'uid': uid, '_id': {"$in": map(g.mdb.toObjectId, _tidList)}}
        for k in _extneeds[int(idx)]:
            if k in ['star']:
                _where[k] = _extneeds[int(idx)][k]
            elif k == 'samezhongzu' and _extneeds[int(idx)]['samezhongzu'] == 1:
                _where['zhongzu'] = _hero_info['zhongzu']
            elif k == 'sxhero':
                _hid = _hero_info['hid']
                _where['hid'] = getHeroCon(_hid)['sxhid']
        _sx_heros = g.mdb.find('hero', _where)

        if _num != len(_sx_heros):
            _res['res'] = False
            return _res

        _res['herolist'] += _sx_heros

    return _res


def ChkHero(_con, heroinfo, herolist, ishecheng=1, tidai=None):
    #heroinfo = 目标英雄的配置
    #herolist = delhero数组集合
    _res = {'res': False}
    if not herolist and not tidai:
        return _res

    tidai = tidai or {}

    _allNum = sum([x.get('num',0) or x.get('n',0) for i in _con if i in ('delhero','chkhero') for x in _con[i]])
    if len(herolist) + sum(tidai.values()) != _allNum:
        return _res

    _sxHeroNum = 0
    _chkHeros, _delHeros = [], []

    _itemCon = g.GC['item']
    # 傀儡羊转换成英雄
    _klyinfo = []
    for itemid, num in tidai.items():
        itemid = str(itemid)
        if _itemCon[itemid]['star'] == '':
            return _res
        # 傀儡英雄
        _temp = {'zhongzu':int(_itemCon[itemid]['zhongzu']) if _itemCon[itemid]['zhongzu'] else heroinfo['zhongzu'],'star':int(_itemCon[itemid]['star']),'tidai':1}
        for i in xrange(num):
            _klyinfo.append(_temp)

    for i in herolist + _klyinfo:
        # 英雄合成
        if ishecheng:
            #_con = herohecheng中配置
            for condDict in _con['delhero']:
                if i['hid'] == condDict['t']:
                    _delHeros.append(i)
                    break
            else:
                for condDict in _con['chkhero']:
                    if i['star'] == condDict['star']:
                        if (condDict['samezhongzu'] and heroinfo['zhongzu'] == i['zhongzu']) or not condDict['samezhongzu']:
                            _chkHeros.append(i)
                            break
        # 升星判断
        else:
            for condDict in _con['delhero']:
                # 星级相同 并且（种族随便或者 种族相同）
                # if condDict.get('star') == i['star'] and ((not condDict.get('samezhongzu') or heroinfo['zhongzu'] == i['zhongzu']) or (condDict.get('jichuzhongzu') or i['zhongzu'] in [1,2,3,4]) or (not condDict.get('jichuzhongzu') and not condDict.get('samezhongzu'))):
                if condDict.get('star') == i['star'] and any([
                    not condDict.get('samezhongzu') or heroinfo['zhongzu'] == i['zhongzu'],
                    condDict.get('jichuzhongzu') and i['zhongzu'] in [1, 2, 3, 4],
                    condDict.get('gaojizhongzu') and i['zhongzu'] in [5, 6],
                    # not condDict.get('jichuzhongzu') and not condDict.get('samezhongzu')
                ]):
                    if ('num' in condDict and condDict['num'] > 0) or ('n' in condDict and condDict['n'] > 0):
                        _delHeros.append(i)
                        if 'num' in condDict: condDict['num'] -= 1
                        if 'n' in condDict: condDict['n'] -= 1
                        break
                elif condDict.get('sxhero') and condDict['num'] > 0:
                    _sxHeroNum = condDict.get('num')
                    if i['hid'] == heroinfo['sxhid']:
                        _chkHeros.append(i)
                        condDict['num'] -= 1
                        break
                    # 如果有sxhero的要求 个数不满足
                    # elif herolist[-1] == i and len(_chkHeros) != _sxHeroNum:
                    #     return _res
    
    if ishecheng:  
        #如果是合成的话，需要校验必须材料是否一致，否则不匹配的材料有可能会满足 chkHero配置，而计入到_chkHeros数组
        #导致会错误的通过 下方只累加总数的判断
        if len(_delHeros) < sum(_dc.get('n',0) for _dc in _con['delhero']):
            return _res
    
    #只判断总数不够
    if len(_chkHeros + _delHeros) == _allNum:
        _res['res'] = True
        _res['herolist'] = herolist
    return _res

# 获取融魂暴击的系数
def getBuffCrit():
    _con = g.GC['meltsoulcom']['base']['crit']
    _base = sum(map(lambda x: x['p'], _con))
    _res = g.C.RANDARR(_con, _base)
    return _res['modulus']


# 增加extbuff里的对应属性
def addExtbuffVal(extbuff, type2buff, isinc=1):
    if not extbuff:
        extbuff = type2buff
    else:
        _type = type2buff.keys()[0]
        if _type not in extbuff:
            extbuff.update(type2buff)
        else:
            for i in type2buff[_type]:
                for buffKey, val in i.items():
                    for buff in extbuff[_type]:
                        if buffKey in buff:
                            buff[buffKey] = buff[buffKey] + val if isinc else val
                            break
                    else:
                        extbuff[_type].append(i)

    return extbuff


# 获取hid对应的融魂属性
def getMSbuff(hid, data, lv):
    _res = []
    _limit = g.GC['meltsoul'][hid][str(lv)]['upperlimit']
    for buff in data:
        for key in _limit:
            if key in buff:
                _res.append({key: buff[key] if buff[key] < _limit[key] else _limit[key]})
    return _res


# 监听英雄统御
def onHeroTongyu(uid, hid, star=None):
    _con = g.GC['hero'][hid]
    _star = _con['star']
    # 只有超过五星的才能激活统御
    if _star < 5:
        return

    _plId = _con['pinglunid']
    if _plId not in g.GC['tongyu']['base']['herozu']:
        return

    # 5星对应1级   6星2级  10星6级
    # 以后增加11星 也是6级
    if not star:
        _tyLV = _star - 4 if _star < 10 else 7
    else:
        _tyLV = star - 4 if star < 10 else 7

    _nt = g.C.NOW()
    _data = g.mdb.find1('tongyu', {'uid': uid, 'tyid': _plId}, fields=['_id'])
    _setData = {}
    if not _data:
        _setData['ctime'] = _nt
        _setData["maxlv"] = _tyLV
        _setData["mylv"] = 0
    elif _data['maxlv'] < _tyLV:
        _setData["maxlv"] = _tyLV
    else:
        return

    _setData['lasttime'] = _nt
    g.mdb.update('tongyu', {'uid': uid, 'tyid': _plId}, _setData, upsert=True)


# 通过天命数量获取buff 和 奖励
def getDestinyData(num):
    _res = {'buff': [], 'prize': [], 'avater': '','zhanli':0, 'chenghao':''}
    for i in g.GC['tongyu']['base']['destiny']:
        if num >= i[0]:
            _res['buff'] = i[1]['buff']
            _res['prize'] = i[1]['prize']
            _res['avater'] = i[1]['avater']
            _res['zhanli'] = i[1]['zhanli']
            _res['chenghao'] = i[1]['chenghao']
        else:
            break
    return _res

#检测英雄是否有tid
def onChkHeroSkin(uid,herodata):
    _chkSkinTid = []
    _sendData = {'skin':{}}
    for h in herodata:
        if 'skin' not in h:
            continue
        
        _skinTid = h['skin']['tid']
        _chkSkinTid.append(g.mdb.toObjectId(h['skin']['tid']))
        _sendData['skin'][_skinTid] = {'wearer': ''}
        
    if len(_chkSkinTid) == 0:
        return

    g.mdb.update('skin', {'uid':uid,'_id':{'$in':_chkSkinTid}},{'$unset':{'wearer':1}})
    g.sendUidChangeInfo(uid,_sendData)

# 14星以上的任务
def onStarUpgrade(uid,star):
    _data = g.getAttrByCtype(uid, 'hero_starupgrade',bydate=False,default={})
    _con = g.GC['herocom']['star2cond']
    _set = {}
    for starCon, ele in _con.items():
        if star != ele['star'] or _data.get(starCon, 0) >= ele['pval']:
            continue

        _num = g.mdb.count('hero',{'uid':uid,'star':star})
        if _num <= _data.get(starCon, 0):
            continue
        _set['v.{}'.format(starCon)] = _num
    if _set:
        g.setAttr(uid, {'ctype':'hero_starupgrade'}, _set)

# 监听viplvchange事件，重新计算英雄属性
g.event.on("viplvchange", onChangeHeroBuff)
# 监听英雄统御事件
g.event.on("hero_tongu", onHeroTongyu)
# 监听删除的英雄是否有皮肤
g.event.on("chkdelhero_skin", onChkHeroSkin)
# 14星以上的任务
g.event.on("STAR_UPGRADE", onStarUpgrade)

if __name__ == '__main__':
    uid = g.buid('lsq0')
    reSetHeroBuff(uid,'5d55ef979dc6d656ac41be7e')
    # reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})
    # g.event.emit('STAR_UPGRADE', '0_5ccf51b49dc6d628852f1748', 13)