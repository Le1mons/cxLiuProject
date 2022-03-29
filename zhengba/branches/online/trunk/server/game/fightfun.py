#!/usr/bin/python
#coding:utf-8

'''
战斗相关公共方法
'''
import g

#测试格式化战斗数据
def test_fmtData(hid,djlv,side,pos,data=None):
    _hid = str(hid)
    _con = g.GC['hero'][_hid]
    _heroData = {}
    _heroData.update(_con)
    _heroData['lv'] = 60
    _heroData['dengjielv'] = djlv
    _heroData['side'] = side
    _heroData['pos'] = pos
    if data!=None:
        _heroData.update(data)
    if djlv >= 6:
        _heroCon = g.m.herofun.getHeroCon(_hid)
        # 开启的被动技能个数
        _bdskillNum = g.m.herofun._getHeroBDskillNum(_hid, djlv)
        if _bdskillNum > 0:
            _skill,_buff = [],[]
            _con = None
            djlvStr = str(djlv)
            if djlvStr in g.GC['herostarup'][_hid]:
                _con = g.GC['herostarup'][_hid][str(djlv)]

            _loopNum = _bdskillNum + 1
            for i in xrange(1, _loopNum):
                _key = g.C.STR('bd{1}skill', i)
                if _con and _key in _con:
                    _skill += _con[_key]

            for bid in _skill:
                a = g.GC.skill
                skill = g.GC.skill[bid]
                _attr = str(skill['type'])
                if _attr != '1':
                    continue

                _buff.append({skill['attr']: skill['v']})
            _heroData['herobuff'].update({'bdskillbuff':_buff})
    _data = g.m.herofun.makeHeroBuff(_heroData)
    _heroData.update(_data)
    if data != None:
        _heroData.update(data)
     
    _fightData = fmtFightData(_heroData)
    
    if data and 'skill' in data:
        _fightData['skill'] = data['skill']    

    return _fightData

#格式化战斗信息
#extdata：附加数据
def fmtFightData(fdata,extdata=None):
    _res = {}
    _res['hid'] = fdata['hid']
    _res['atk'] = fdata['atk']
    _res['def'] = fdata['def']
    _res['hp'] = fdata['hp']
    _res['maxhp'] = fdata['hp']
    _res['speed'] = fdata['speed']
    _res['atkpro'] = fdata['atkpro']
    _res['defpro'] = fdata['defpro']
    _res['hppro'] = fdata['hppro']
    _res['speedpro'] = fdata['speedpro']
    _res['jingzhunpro'] = fdata['jingzhunpro']
    _res['gedangpro'] = fdata['gedangpro']
    _res['baojipro'] = fdata['baojipro']
    _res['baoshangpro'] = fdata['baoshangpro']
    _res['skilldpspro'] = fdata['skilldpspro']
    _res['dpspro'] = fdata.get('dpspro',0)
    _res['pojiapro'] = fdata['pojiapro']
    _res['undpspro'] = fdata['undpspro']
    _res['miankongpro'] = fdata['miankongpro']
    _res['jianshangpro'] = fdata['jianshangpro']
    _res['lv'] = fdata['lv']
    _res['dengjielv'] = fdata['dengjielv']
    _res['star'] = fdata.get('star', fdata['dengjielv'])
    _res['normalskill'] = fdata['normalskill']
    _res['xpskill'] = fdata['xpskill']
    _res['bd1skill'] = fdata['bd1skill']
    _res['bd2skill'] = fdata['bd2skill']
    _res['bd3skill'] = fdata['bd3skill']
    #_bdskill = fdata['bd1skill'] + fdata['bd2skill'] + fdata['bd3skill']
    _res['skill'] = g.m.herofun.getOpenBDSkillByHeroData(_res)
    _res['skill'] += getAtachSkills(fdata)
    _res['nuqi'] = 50
    _res['maxnuqi'] = 100
    
    _res['side'] = fdata['side']
    _res['pos'] = fdata['pos']
    _res['job'] = fdata['job']
    _res['zhongzu'] = fdata['zhongzu']
    if extdata != None:
        #处理额外数据
        # _res.update(extdata)
        for i in extdata:
            if i in _res:
                _res[i] += extdata[i]
            else:
                _res[i] = extdata[i]
    return _res

# 获取所有的额外skill
def getAtachSkills(hero):
    _res = []
    # 获取饰品提供的skill
    if 'weardata' in hero and '5' in hero['weardata']:
        _spId = hero['weardata']['5']
        _skill = g.GC['shipin'][str(_spId)]['skill']
        _res += _skill
    # 获取雕纹提供的技能
    _gCon = g.GC['glyphextra']['extskill']['id']
    # _res.extend([_gCon[hero['glyph'][x]['extskill']]['skillid'][0] for x in hero.get('glyph',{}) if 'extskill' in hero['glyph'][x]])
    for x in hero.get('glyph', {}):
        if 'extskill' in hero['glyph'][x]:
            _res.extend(_gCon[hero['glyph'][x]['extskill']]['skillid'])

    return list(set(_res))

# 修改英雄buff 
def changeHeroBuff(herolist, modulus):
    _temp = ['atk','def','hp','speed','atkpro','defpro','hppro','speedpro','jingzhunpro','gedangpro','baojipro','baoshangpro','skilldpspro',
    'pojiapro','miankongpro','jianshangpro','nuqi','maxhp']
    for hero in herolist:
        for key in hero:
            if key in _temp:
                hero[key] = int(modulus * hero[key])
    return herolist

#检测玩家战斗信息,并返回战斗英雄数组,并且算好阵法
'''
fightdata:战斗数据 ，{"1":"tid","2":"tid"} || {}
ftype:挑战类型
'''
def chkFightData(uid,fightdata,head=None):
    _res = {'chkres':1,'herolist':[],'zhanli':0}
    if len(fightdata) == 0:
        return _res
    
    _chkPos = [1,2,3,4,5,6]
    _tid2Object = []
    _tid2pos = {}
    for pos,tid in fightdata.items():
        if pos == 'sqid':
            continue
        _pos = int(pos)
        if _pos not in _chkPos:
            #站位参数错误
            _res['chkres'] = -1
            _res['errmsg'] = 'CheckFightData_PosErr'
            return _res
        
        _objid = g.mdb.toObjectId(tid)
        if _objid in _tid2Object:
            #有重复英雄上场
            _res['chkres'] = -2
            _res['errmsg'] = 'CheckFightData_Repeated'
            return _res
        
        _tid2Object.append(_objid)
        _tid2pos[tid] = _pos
        
    _heroData = g.mdb.find('hero',{'uid':uid,'_id':{'$in':_tid2Object}})
    if len(_heroData) == 0 or len(_tid2Object) != len(_heroData):
        #上阵英雄参数有误
        _res['chkres'] = -3
        _res['errmsg'] = 'CheckFightData_TidErr'
        return _res
    
    #阵法id
    '''_res['zfid'] = getZhenFaBuffId(_heroData)
    _zfBuff = {}
    if _res['zfid'] != "":
        _zfBuff = g.GC['fightcom']['zhenfa'][_res['zfid']]['buff']
        
    for d in _heroData:
        _tmp = d
        _tmp['pos'] = _tid2pos[str(_tmp['_id'])]
        if _zfBuff: _tmp = caleHeroBuffByZhenFa(_tmp,_zfBuff)
        _res['herolist'].append(_tmp)
        '''
    
    for d in _heroData:
        _res['zhanli'] += d['zhanli']
        _tmp = d
        _tmp['pos'] = _tid2pos[str(_tmp['_id'])]
        _res['herolist'].append(_tmp)

    if not head:
        _res['headdata'] = g.m.userfun.getShowHead(uid)
    else:
        _res['headdata'] = head
    return _res


#格式化玩家出站信息
'''
herolist:英雄信息列表，子元素需要有pos存在
ftype:挑战类型
'''
def getUserFightData(uid,herolist,side,ftype=None,sqid=None):
    _res = []
    _side = int(side)
    # 携带神器战斗
    _shenqiBuff = {}
    if sqid:
        sqid = str(sqid)
        _artifactInfo = g.m.artifactfun.getArtifactInfo(uid, fields=['_id'])
        if _artifactInfo and sqid in _artifactInfo['artifact']:
            _artifact = _artifactInfo['artifact'][sqid]
            _lv = _artifact['lv']
            _dengjie = _artifact['djlv']
            _shenqiBuff.update(g.GC['shenqibuff'][sqid][str(_lv)]['buff'])
            _djBuff = g.m.artifactfun.getBuffByDengjie(sqid, _dengjie)
            _shenqiBuff.update(_djBuff)
            _res.append({'sqid': sqid, 'side': side, 'djlv':_dengjie})

    for h in herolist:
        h['side'] = _side
        _tmp = fmtFightData(h,extdata=_shenqiBuff)

        _res.append(_tmp)
        
    return _res


#获取npc战斗信息
def getNpcFightData(npcid):
    _npcList = g.m.npcfun.getNpcById(npcid)
    _res = {'herolist':_npcList,'headdata':{}}
    #_hcon = g.m.herofun.getHeroCon(_npcList[0]['hid'])
    _res['headdata']['name'] = g.m.herofun.getHeroCon(_npcList[0]['hid'])['name']
    _res['headdata']['lv'] = _npcList[0]['lv']
    _res['headdata']['head'] = _npcList[0]['head']
    _res['headdata']['dengjielv'] = _npcList[0]['dengjielv']
    '''
    _zfid = getZhenFaBuffId(_npcList)
    if _zfid != '':
        _res['zfid'] = _zfid
        _zfBuff = g.GC['fightcom']['zhenfa'][_zfid]['buff']
        for d in _npcList:
            caleHeroBuffByZhenFa(d,_zfBuff)
            '''

    return _res

#计算阵法buff和英雄buff的融合机制
#hero:英雄信息
#zfbuff：阵法buff
def caleHeroBuffByZhenFa(hero,zfbuff):
    _hero = hero
    #特殊处理的buff
    _extBuffKey = {
        "atkpro":"atk",
        "defpro":"def",
        "hppro":"hp",
        "speed":"speedpro"
    }
    for k,v in zfbuff.items():
        if k in _extBuffKey:
            _hero[_extBuffKey[k]] = int(_hero[_extBuffKey[k]] * (1 + v * 0.001))
        else:
            _hero[k] += v
            
    return _hero

#获取阵法buffid
def getZhenFaBuffId(herolist):
    _res = ''
    if len(herolist) < 6:
        return _res
    
    _zhongzu2num = {}
    for h in herolist:
        _zhongzu = str(h['zhongzu'])
        if _zhongzu not in _zhongzu2num:_zhongzu2num[_zhongzu] = 0
        _zhongzu2num[_zhongzu] += 1
        
    _ghCon = g.GC['fightcom']['zhenfa']
    for bfid,v in _ghCon.items():
        _cond = v['cond']
        _ispass = 1
        for zz,num in _cond.items():
            if zz not in _zhongzu2num:
                _ispass = 0
                break
            if _zhongzu2num[zz] < num:
                _ispass = 0
                break
            
        if not _ispass:
            continue
        
        _res = bfid
        break
    
    return _res

# 获取剩余血量百分比
def isJumpOver(roles):
    _res = False
    _maxhp, _curHp = 0, 0
    for k, v in roles.items():
        if v['side'] == 0 and 'sqid' not in v:
            _maxhp += v['maxhp']
            _curHp += v['hp']
    _modulus =  int(_curHp  * 100.0 / _maxhp)
    if _modulus >= 70:
        return g.C.RAND(100, 20)
    return _res
            
        
if __name__ == '__main__':
    # for i in xrange(1,11):
    #     print i , test_fmtData('51016',i,0,1)
    #
    # _dd = [1,2,3,5,76,7]
    # print sum(_dd)
    # print getNpcFightData('344')
    uid = g.buid("666")
    _time = g.C.NOW('2018-9-06')
    print g.C.RAND(100, 15)