#!/usr/bin/python
#coding:utf-8

'''
神殿迷宫模块
'''
import g,random

# 获取下次重置的时间
def getResetTime():
    _kaifuTime = g.GC['mazecom']['base']['kaifutime']
    _day = g.C.getTimeDiff(g.C.NOW(), _kaifuTime, 0) + 1

    _temp = _day % 2+1
    if getMazeCD(1)['n'] > 0:
        _temp = 1
    return g.C.ZERO(g.C.NOW()) + 24*3600 * _temp

# 获取备战的英雄数据
def getPrepareHeroData(uid, herolist):
    _res,_tidList = [], []
    for pos,i in enumerate(herolist):
        i['side'] = 0
        i['pos'] = pos + 1
        _tmp = g.m.fightfun.fmtFightData(i)
        _tmp['tid'] = str(i['_id'])
        _tmp['uid'] = uid
        _tmp['zhanli'] = i['zhanli']
        if 'skin' in i:
            _tmp['skin'] = i['skin']
        _res.append(_tmp)
        _tidList.append(_tmp['tid'])

    return _res, _tidList

# 获得迷宫数据
def getMazeData(uid, level, diff, black, avglv=70):
    _con = g.GC['maze'][level][diff]
    _comCom = g.GC['mazecom']['base']['modulus'][level][diff]
    _resData = {}
    _heros = []
    _boss = getRivals(uid, 30)
    _zmheros = getRivals(uid, 16)
    _tidnum = 0
    for step in _con:
        if not _con[step]:
            continue
        _event = []
        for i in _con[step]:
            _res = {'event': i['event']}
            # boss事件
            if i['event'] in ('4','2','3'):
                _res['prize'] = i['prize']
                if 'reliccolor' in i:
                    _res['reliccolor'] = i['reliccolor']
                # 系数小于1就换个方法找
                _modulus = sum(_comCom[step][i['event']].values()) / len(_comCom[step][i['event']])
                if _modulus < 1:
                    _rival = getRivals(uid,1,cache=0,modulus=_modulus)[0]
                else:
                    _rival = _boss.pop()
                    for npc in _rival['hero']:

                        for key, val in _comCom[step][i['event']].items():
                            npc[key] *= val
                            npc[key] = int(npc[key])
                        else:
                            npc['maxhp'] *= _comCom[step][i['event']]['hp']

                    _rival['zhanli'] = int((_comCom[step][i['event']]['atk'] + _comCom[step][i['event']]['hp']) / 2 * _rival.get('maxzhanli',_rival.get('zhanli', 0)))
                try:
                    for hero in _rival["hero"]:
                        if i['lv'] > 70:
                            continue
                        _randomLv = g.C.getRandNum(avglv - 10, avglv + 10)
                        if _randomLv < 40:
                            _randomLv = 40
                            hero.update({"lv": _randomLv})
                except:
                    print "err mazerivals"



                _rival['headdata']['name'] = g.L('maze_{}'.format(i['event']))
                _res.update(_rival)
            # 灵魂囚笼
            elif i['event']  == '6':
                _maxzhanli = g.getGud(uid)['maxzhanli']
                _blackHids = []
                _tid = g.C.getUniqCode() + str(_tidnum)
                # print '******************---------------------'
                for x in xrange(4):
                    _tidnum += 1
                    # _user = getRivalHeroData(uid, {}, black, 'cage')
                    # print 'zhanli==>',_user['zhanli']
                    # _user['hero'] = [j for j in _user['hero'] if 'sqid' not in j and j['lv']>=100]
                    _user = _zmheros.pop()
                    _rival = g.C.RANDLIST(_user['hero'])[0]
                    # 相同职业 能升九星
                    _allHero = [k for k, v in g.GC['hero'].items() if v['job'] == _rival['job'] and k.endswith('6') and k not in _blackHids and v["zhongzu"] != 7]
                    _randHid = g.C.RANDLIST(_allHero)[0]
                    _blackHids.append(_randHid)
                    _rival['randhid'] = _randHid
                    _rival['tid'] = _tid
                    _rival.pop('skin', None)
                    # print 'star==>',_rival['dengjielv']
                    _rival['zhanli'] = _maxzhanli / 6
                    _heros.append(_rival)

                # _topHero = max(_heros, key=lambda x:(x['dengjielv'],x['zhanli']))
                # _topHero['uid'] = uid
                # _res['hero'] = _heros

            # 前线营地
            elif i['event']  == '5':
                pass
            # 神秘商人
            elif i['event']  == '8':
                _scon = g.GC['shopitem']
                _res['goods'] = []
                for sid in i['shopitem']:
                    _tempCon = list(_scon[sid])
                    for i in _tempCon:
                        i['p'] = i['item']['p']
                    _prize = g.C.RANDARR(_tempCon, sum(i['item']['p'] for i in _scon[sid]))
                    _res['goods'].append(_prize)
            # 贪婪洞窟
            elif i['event']  == '9':
                _res['dlz'] = i['dlz']
                _res['boss'] = g.C.RANDLIST(i['boss'])[0]
            # 灵魂医者
            elif i['event']  == '7':
                pass
            _event.append(_res)
        g.C.SHUFFLE(_event)
        _resData[step] = _event
    _starCon = g.GC['herostarup']
    # 对灵魂囚笼英雄进行筛选
    _topHero = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
    if not _topHero:
        _myheros = g.mdb.find('hero', {'uid': uid}, fields=['star'], sort=[["zhanli", -1]], limit=6)
    else:
        _myheros = g.mdb.find('hero',{'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _topHero['tid2zhanli'].keys())}},fields=['star'])

    _myStar = sum([x['star'] for x in _myheros]) / 6.0
    # 星级和战力最靠近自己的
    _hero = min(_heros, key=lambda x: (abs(x['dengjielv'] - _myStar), abs(x['zhanli'] - _maxzhanli)))
    _hero['uid'] = uid
    _heroCon = g.GC['pre_hero']
    _skillCon = g.GC['skill']
    # print u'最终==>atk:{0},hp:{1},speed:{2},def:{3},我的star:{4}'.format(_hero['atk'],_hero['hp'],_hero['speed'],_hero['def'],_hero['dengjielv'])
    for step in _resData:
        for i in _resData[step]:
            if i['event'] != '6':
                continue
            i['hero'] = []
            for j in xrange(4):
                _rival = _heros[j]
                _randHid = _rival.pop('randhid')
                _tid = _rival.pop('tid')
                _rival.update(_hero)
                _maxStar = max(int(star) for star in _starCon[_randHid])
                _rival['zhongzu'] = _heroCon[_randHid]['zhongzu']
                _rival['job'] = _heroCon[_randHid]['job']
                _rival['name'] = _heroCon[_randHid]['name']
                _rival['hid'] = _randHid
                _rival['tid'] = _tid
                if _rival["lv"] <= 40:
                    _rival["lv"] = 70
                _rival['side'] = 0
                _rival['bd1skill'] = _starCon[_randHid][str(_maxStar)]['bd1skill']
                _rival['bd2skill'] = _starCon[_randHid][str(_maxStar)]['bd2skill']
                _rival['bd3skill'] = _starCon[_randHid][str(_maxStar)]['bd3skill']
                _rival['skill'] = _rival['bd1skill']+_rival['bd2skill']+_rival['bd3skill']
                # 如果技能是免控
                for skill in _rival['skill']:
                    if _skillCon[skill]['type'] == '1' and _skillCon[skill]['attr'] == 'miankongpro':
                        _rival['miankongpro'] += _skillCon[skill]['v']

                _rival['normalskill'] = _heroCon[_randHid]['normalskill']
                _rival['xpskill'] = _starCon[_randHid][str(_maxStar)]['xpskill']
                i['hero'].append(_rival)
            del _heros[:4]
    return _resData

# 获取对手的信息
def getRivalHeroData(uid, modulus, black, mtype='boss'):
    _res = {'headdata': {}}
    _con = g.GC['mazecom']['base']['xishu'][mtype]
    _maxzhanli = g.getGud(uid)['maxzhanli']
    _w = {'maxzhanli': {'$lte': eval(_con[0]), '$gte': eval(_con[1])}}
    # 缓存
    _uidsArr = g.mc.get('maze_rival_{}'.format(uid))
    if mtype == 'boss' and not _uidsArr:
        _uidNeedLen = 30  # 一次筛出100个uid
        _count = g.crossDB.count("jjcdefhero", _w)
        _skip = 0  # 在合法范围内skip
        if _count > _uidNeedLen:
            _skip = random.randint(1, _count - _uidNeedLen) - 1
        _uidsArr = g.crossDB.find("jjcdefhero", _w, fields=['_id', 'uid','maxzhanli'], limit=_uidNeedLen,
                                  skip=_skip)  # [{uid:1},{uid:2}]
        _uidsArr = [i for i in _uidsArr if i['uid'] != uid]
        g.mc.set('maze_rival_{}'.format(uid), _uidsArr, 60)  # 缓存uid指定时长

    if mtype == 'boss' and _uidsArr and len(_uidsArr) > 0:
        _enemyUid = random.sample(_uidsArr, 1)[0]['uid']
        while _enemyUid in black:
            _enemyUid = random.sample(_uidsArr, 1)[0]['uid']
        _rival = g.crossDB.find1("jjcdefhero", {"uid": _enemyUid}, fields=['_id','headdata','fightdata','maxzhanli','uid'])

        for i in xrange(len(_uidsArr)):
            if _rival and len([i for i in _rival['fightdata'] if 'hid' in i]) < 6:
                _enemyUid = random.sample(_uidsArr, 1)[0]['uid']
                _rival = g.crossDB.find1("jjcdefhero", {"uid": _enemyUid},fields=['_id', 'headdata', 'fightdata', 'maxzhanli','uid'])
            else:
                break

    else:
        _rival = g.crossDB.find1_rand("jjcdefhero", _w, fields=['_id', 'fightdata', 'headdata','maxzhanli','uid'])
    if not _rival:
        _rival = g.crossDB.find1("jjcdefhero", {'maxzhanli':{'$lte': eval(_con[1])}}, sort=[['maxzhanli',-1]],fields=['_id', 'fightdata', 'headdata','maxzhanli','uid'])

    for j in xrange(100):
        # _list = [i for i in _rival['fightdata'] if 'sqid' not in i] if mtype == 'boss' else [i for i in _rival['fightdata'] if 'sqid' not in i and i['lv']>=100]
        _list = [i for i in _rival['fightdata'] if 'hid' in i]
        if _rival and len(_list) < 6:
            _rival = g.crossDB.find1_rand("jjcdefhero", _w, fields=['_id', 'fightdata', 'headdata', 'maxzhanli','uid'])
        else:
            break

    if not _rival:
        npcid = g.m.shizijunfun.getNpcByNum(uid)
        _rival = g.m.fightfun.getNpcFightData(npcid)
        _rival = {'fightdata': _rival['herolist'], 'headdata': _rival['headdata']}
        _rival['maxzhanli'] = g.m.npcfun.getNpcZhanli(_rival['herolist'])

    _rival['fightdata'] = [i for i in _rival['fightdata'] if 'hid' not in i]
    _zhanli = _rival.pop('maxzhanli')
    if modulus:
        # _allAtk = _allHp = 0
        for i in _rival['fightdata']:
            if 'hid' not in i:
                continue
            for key,val in modulus.items():
                i[key] *= val
                i[key] = int(i[key])
            else:
                i['maxhp'] *= modulus['hp']
                # _allAtk += i['atk']
                # _allHp += i['hp']
        _zhanli = int(modulus['atk'] * _zhanli)

        # _zhanli = int(_zhanli - (1.0-modulus['atk']) * _allAtk - (1.0 - modulus['hp']) * _allHp / 6)
    _res = {'hero': _rival['fightdata'], 'headdata': _rival['headdata'], 'zhanli': _zhanli}
    return _res

# 获取对手的信息
def getRivals(uid, _allNum, mtype='boss', cache=1, modulus=1):
    def findHero(_users, _userNum, _res):
        _gud = g.getGud(uid)
        for i in _users:
            i['hero'] = [x for x in i['fightdata'] if 'hid' in x and int(x['pos']) in range(1,7)]
            if len(i['hero']) < 6:
                continue

            i['headdata']['lv'] = _gud['lv']
            i['headdata']['head'] = i['hero'][0]['hid']
            i['maxzhanli'] = i['zhanli']
            _userNum += 1
            _res.append(i)
            if _userNum >= _allNum:
                break
        return _userNum

    # 有缓存
    _uids = g.mc.get('maze_boss_{}'.format(uid))
    if cache and _uids:
        _res = g.crossDB.find("jjcdefhero", {'uid': {'$in': _uids}},fields=['_id', 'headdata', 'zhanli', 'fightdata'], limit=_allNum)
        for i in _res:
            i['hero'] = [x for x in i['fightdata'] if 'hid' in x]
    else:
        _con = g.GC['mazecom']['base']['xishu'][mtype]
        _maxzhanli = g.getGud(uid)['maxzhanli']
        _users = g.crossDB.find("jjcdefhero", {'zhanli': {'$lte': eval(_con[0]), '$gte': eval(_con[1])}}, fields=['_id', 'headdata', 'zhanli','fightdata','uid'], limit=50)
        g.C.SHUFFLE(_users)
        _userNum, _res = 0, []
        _userNum = findHero(_users, _userNum, _res)
        if _userNum < _allNum:
            _skip = 0
            for i in xrange(5):
                # 不足30个  还需要补充
                _users = g.crossDB.find("jjcdefhero", {'zhanli': {'$lte': eval(_con[1])}},fields=['_id','headdata','zhanli','fightdata','uid'],limit=20,sort=[['zhanli',-1]],skip=_skip)
                _userNum = findHero(_users, _userNum, _res)
                if _userNum >= _allNum:
                    break
                _skip += 20
        if cache:
            # 设置缓存
            _uids = map(lambda x:x['uid'], _res)
            g.mc.set('maze_boss_{}'.format(uid), _uids, 60)

    if not _res:
        npcid = g.m.shizijunfun.getNpcByNum(uid)
        _rival = g.m.fightfun.getNpcFightData(npcid)
        _rival = {'hero': _rival['herolist'], 'headdata': _rival['headdata']}
        _rival['maxzhanli'] = g.m.npcfun.getNpcZhanli(_rival['hero'])

        _res = [g.C.dcopy(_rival) for i in xrange(_allNum)]
    else:
        while _allNum - len(_res) > 0:
            _res += g.C.dcopy(g.C.RANDLIST(_res, _allNum - len(_res)))

        g.C.SHUFFLE(_res)
    return _res

# 获取胜利后的随机遗物奖励
def getWinRelic(reliccolor, relic):
    _res = []
    _con = g.GC['mazecom']['base']
    for i in xrange(3):
        _rColor = g.C.RANDARR(_con['reliccolor'][reliccolor], sum(i['p'] for i in _con['reliccolor'][reliccolor]))
        data = _con['relicdlz'][_rColor['relicdlz']]
        _baseP = sum(i['p'] for i in data)
        _randRes = g.C.RANDARR(data, _baseP)
        while _randRes['num']-relic.get(_randRes['rid'], 0) <= 0 or _randRes['rid'] in _res:
            _randRes = g.C.RANDARR(data, _baseP)
        _res.append(_randRes['rid'])
    return _res

# 检查下得这一步棋是否合理
def chkCanChess(step, idx, preIdx):
    _res = False
    # 第二层和最后一层
    if step == '2' or step == str(g.GC['mazecom']['base']['level']):
        _res = True
    elif len(g.GC['maze']['1']['1'][step]) == 2 and abs(preIdx - idx) in (0, 1):
        _res = True
    elif len(g.GC['maze']['1']['1'][step]) == 3 and idx - preIdx in (0, 1):
        _res = True
    return _res

# 获取玩家所有的英雄tid
def getUserTidList(uid):
    _res = g.mc.get('maze_tidlist_{}'.format(uid))
    if not _res:
        _allHero = g.mdb.find('mazehero',{'uid': uid},fields=['_id','tid'])
        _res = map(lambda x:x['tid'], _allHero)
        g.mc.set('maze_tidlist_{}'.format(uid), _res)

    return _res

# 设置战斗状态
def setHeroStatus(fightres, fightdata):
    _status = {}
    for k, v in fightres['fightres'].items():
        if v['side'] != 0 or 'hid' not in v:
            continue
        # 如果pos是7 并且 大于0
        if k in fightres['roles'] and fightres['roles'][k]['pos'] == 7 and fightres['fightres'][k]['pos'] != 7:
            _pos = 7
        elif k in fightres['roles'] and fightres['roles'][k]['pos'] != 7 and fightres['fightres'][k]['pos'] == 7:
            _pos = fightres['roles'][k]['pos']
        else:
            _pos = v['pos']
        _tid = fightdata[str(_pos)]
        # 修改为按百分比继承，而不是绝对值
        _status[_tid] = {'hp': int(v['hp'] * 100.0 / v['maxhp']), 'nuqi': v['nuqi'] if v['nuqi'] > 50 else 50}
    return _status

# 获得红点数据
def getMazeHD(uid):
    _res = 0
    if not g.chkOpenCond(uid, 'maze'):
        return 0

    _maze = g.mdb.find1('maze', {'uid': uid}, fields={'cd':1,'reclist':1,'total':1})
    if _maze and _maze.get('total'):
        _con = g.GC['mazecom']['base']['landmark']
        for lid,ele in _con.items():
            if _maze['total'].get(ele['cond']['diff']) >= ele['cond']['num'] and lid not in _maze.get('reclist',[]):
                return 2

    if not _maze:
        _res = 1
    elif g.C.NOW() >= _maze['cd']:
        _res = 1
    else:
        _res = _maze['cd']
    return _res

# 获得基础属性的pro加成
def getBaseBuffPro(relic, job, step, diff):
    _con = g.GC['mazerelic']
    _res = {}
    for rid,num in relic.items():
        # 战斗时的技能
        if not _con[rid]['buff'] or rid in ('13','14','15','16','17','18'):
            continue
        # 职业不同
        if 'job' in _con[rid] and job != _con[rid]['job']:
            continue
        # 层数不同
        if 'cond' in _con[rid] and 'stage' in _con[rid]['cond'] and _con[rid]['cond']['stage'] != step and _con[rid]['cond']['diff'] != diff:
            continue

        # 王者之石头
        if rid == '28':
            _num = sum(relic[i] for i in relic if _con[i]['color']>=_con[rid]['cond']['color'])
            _buff = {}
            for key,val in _con[rid]['buff'].items():
                _buff[key] = min(_num*val, _con[rid]['cond']['maxpro'])
        else:
            _buff = _con[rid]['buff']

        for key,val in _buff.items():
            # if key.startswith('hp' or 'def' or 'atk' or 'speed'):
                _res[key] = _res.get(key,0)+val*num
            # else:
            #     _res[key] = _res.get(key, 0) + val * num
    return _res

# 获取战中的技能
def getSkills(hid, relic):
    if not relic:
        return []

    _res = []
    _con = g.GC['mazerelic']
    for rid,num in relic.items():
        if not _con[rid]['skill'] or rid == '73':
            continue
        if 'hid' in _con[rid] and hid not in _con[rid]['hid']:
            continue
        _res += _con[rid]['skill'] * num
    return _res

# 获取所有开战的英雄数据
def getFightHeroList(uid, myheros, data, relic):
    _con = g.GC['mazerelic']
    if data['event'] != '9':
        rivals = data['hero']
    else:
        _COMcon = g.GC['mazecom']['base']['bosslist'][data['boss']]
        rivals = list(_COMcon['boss'])
        _topHero = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
        if not _topHero:
            _heros = g.mdb.find('hero', {'uid': uid}, fields=['hp'], sort=[["zhanli", -1]], limit=6)
        else:
            _heros = g.mdb.find('hero', {'uid': uid, '_id':{'$in':map(g.mdb.toObjectId,_topHero['tid2zhanli'].keys())}}, fields=['hp'])
        _hp = sum(i['hp'] for i in _heros)
        for i in rivals:
            i['hp'] = i['maxhp'] = _hp * _COMcon['hpmodulus']
            i['speed'] = int(i['speed'] * 0.9)

    # 雷罚脉冲
    if '73' in relic:
        for i in rivals:
            if 'hid' not in i:
                continue
            i['skill'] = list(i['skill'])
            i['skill'] += list(_con['73']['skill']) * relic['73']

    return myheros + rivals

# 获取所有迷宫出战的英雄
def getMazeHeroFightdata(uid, tids, growbuff, sqid=None):
    _heros = g.mdb.find('mazehero',{'uid':uid,'tid':{'$in': tids}},fields={'_id':0,'uid':0})
    _con = g.GC['mazerelic']

    _shenqiBuff = {}
    if sqid:
        _sq, _shenqiBuff = g.m.artifactfun.getFightInfo(uid, 0, sqid)

    for i in _heros:
        if 'speed' in _shenqiBuff:
            i['speed'] += _shenqiBuff['speed']

        if 'relicbuff' not in i and 'growbuff' not in i:
            continue

        _relicBuff = i.get('relicbuff', {})
        for _,buff in growbuff.items():
            g.mergeDict(_relicBuff, buff, 1)
        for key,val in _relicBuff.items():
            if key.replace('pro', '') in ('hp', 'def', 'atk', 'speed'):
                _setKey = key.replace('pro','')
                i[_setKey] = int(i[_setKey] * (1 + val/1000.0))
            else:
                i[key] = i.get(key, 0) + val

    if sqid:
        # _sq, _shenqiBuff = g.m.artifactfun.getFightInfo(uid, 0, sqid)
        _heros += _sq

    _heros += g.m.petfun.gtPetFight(uid, 0)

    return _heros

# 获取迷宫倒计时
def getMazeCD(uid):
    _hd = g.m.huodongfun.getHDinfoByHtype(59)
    if _hd and 'hdid' in _hd:
        return {'s': _hd['stime'], 'n': _hd['rtime']}
    else:
        return {'s': 0, 'n': 0}


# 获取迷宫通关次数
def getSaoDangInfo(uid):
    _ctype = "maze_saodang"
    return g.getAttrByCtype(uid, _ctype, bydate=False, default={})


# 设置迷宫通关次数
def setSaoDangInfo(uid, data):
    _ctype = "maze_saodang"
    g.setAttr(uid, {"ctype":_ctype}, {"v":data})



if __name__ == '__main__':
    uid = g.buid('zhy001')
    _mazeData = getMazeData(uid, '1', '1', [uid])
    _data = {
        '$set': {
            'ctime': g.C.NOW(),
            'trace': {'1': {'idx': 0, 'finish': 1}},
            'maze': _mazeData,
            'step': 1,  # 第一关
            'diff': "1",  # 难度
            "cd": g.m.mazefun.getResetTime()
        },
        "$unset": {i: 1 for i in
                   ('status', 'fightless', 'relic', 'growbuff', 'relicprize', 'dajixue', 'WinOrLose', 'receive')}
    }
    g.mdb.update('maze', {'uid': uid}, _data, upsert=True)