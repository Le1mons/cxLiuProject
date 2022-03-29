#!/usr/bin/python
# coding:utf-8

'''
自由竞技场相关功能
'''
import g

# 获取对手缓存数据
def getEnemyFightData(uid, fightdata):
    _res = g.mc.get('zypkjjc_enemydata_{}'.format(uid)) or {}
    if not _res:
        _chkFightData = g.m.fightfun.chkFightData(uid, fightdata, side=1)
        _res['s'] = 1
        if _chkFightData['chkres'] < 1:
            if len(fightdata) in (1, 0):
                # 如果只有神器或者都没有
                g.mdb.delete('zypkjjc', {'uid': uid})
            else:
                # 修复防守阵容
                getDefHeroInfo(uid, 'zypkjjc')
            _res['s'] = -1
            _res['chkres'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res

        _res['zhanli'] = _chkFightData['zhanli']
        _res['res'] = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=fightdata.get('sqid'))
        g.mc.set('zypkjjc_enemydata_{}'.format(uid), _res, 10)
    return _res

# 获取玩家防守阵容数据
def getDefHeroInfo(uid, _type):
    if _type == 'zypkjjc':
        _defHero = g.m.zypkjjcfun.getDefendHero(uid)
        _defHero = [_defHero]
    elif _type == 'championtrial':
        _defHero = g.m.championfun.getDefendHero(uid)
    _tidList = []
    for i in _defHero:
        _tidList += [i[x] for x in i if x not in ('sqid', 'pet')]
    _tidList = map(g.mdb.toObjectId, _tidList)
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _tidList}})

    # 调整站位信息
    _res = []
    _chk = {}
    for x in _defHero:
        _resHero = {}
        for _pos in x:
            if _pos == 'sqid':
                _resHero['sqid'] = _chk['sqid'] = x[_pos]
                continue
            elif _pos == 'pet':
                continue

            for _hero in _heroList:
                if g.mdb.toObjectId(x[_pos]) == _hero['_id']:
                    _hero['_id'] = str(_hero['_id'])
                    _resHero[_pos] = _hero
                    _chk[_pos] = _hero['_id']
        _res.append(_resHero)
    if _type == 'zypkjjc' and len(_chk) != len(_defHero[0]):
        g.m.zypkjjcfun.setUserJJC(uid, {'defhero': _chk})
    return _res

# 获取每天免费挑战次数
def getFreePkNum(uid):
    return g.getPlayAttrDataNum(uid, 'zypkjjc_freenum')


# 设置每天免费挑战次数
def setFreePkNum(uid):
    return g.setPlayAttrDataNum(uid, 'zypkjjc_freenum')


# 获取每天可以免费挑战的次数
def getFreeCanPkNum(uid):
    _maxNum = g.GC['zypkjjccom']['base']['freenum']
    _FreePkNum = getFreePkNum(uid)
    _canNum = _maxNum - _FreePkNum
    if _canNum < 0: _canNum = 0
    return _canNum


# 获取每周挑战次数奖励记录-存在playattr中，默认值是 [],可以自然过期
def getRecPrizeByWeek(uid):
    _nt = g.C.NOW()
    _dkey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_prizelist', 'k': _dkey}
    _info = g.getAttrOne(uid, _w)
    if not _info:
        return []

    return _info['v']


# 设置每周挑战次数奖励记录，领取的奖励记录在数组中
# idx：领取的下标
def setRecPrizeByWeek(uid, idx):
    _recData = getRecPrizeByWeek(uid)
    _nt = g.C.NOW()
    _dkey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_prizelist'}
    _recData.append(idx)
    _data = {'k': _dkey, 'v': _recData}
    g.setAttr(uid, _w, _data)
    return _recData


# 获取每周累计的挑战次数(存在playattr表里面，k的格式是：年-每年第几周)，自然过期归零
def getPkNumByWeek(uid):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_weekpknum', 'k': _dKey}
    _info = g.getAttrOne(uid, _w)
    if not _info:
        return 0

    return _info['v']


# 设置每周累计的挑战次数
def setPkNumByWeek(uid):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _pkNum = getPkNumByWeek(uid)
    _pkNum += 1
    _w = {'ctype': 'zypkjjc_weekpknum'}
    _data = {'v': _pkNum, 'k': _dKey}
    g.setAttr(uid, _w, _data)
    return _pkNum


# 获取玩家玩家的竞技场信息-方法中把要存的所有数据格式注释写出来**重要**
def getUserJJC(uid,**kwargs):
    # ['zhanli','jifen','uid','defhero','ctime]
    _w = {'uid': uid}
    return g.mdb.find1('zypkjjc', _w,**kwargs)


# 设置玩家竞技场信息
def setUserJJC(uid, data):
    _w = {'uid': uid}
    _nt = g.C.NOW()
    _temp = g.mdb.find1('zypkjjc', _w)
    if not _temp:
        _jifen = g.GC['zypkjjccom']['base']['initjifen']
        _data = {
            'jifen': _jifen,
            'ctime': _nt,
            'lasttime': _nt,
            'uid': uid
        }
        _data.update(data)
        g.mdb.insert('zypkjjc', _data)
    else:
        data.update({'lasttime': _nt})
        g.mdb.update('zypkjjc', _w, data)


# 获取刷新对手的方法-本方法只根据规则刷新出对手
def refPkUser(uid):
    _cacheNum = 8
    # 需要刷新出来的玩家数量
    _refUserNum = 3
    _jifen = g.m.zypkjjcfun.getZypkjjcJifen(uid)
    _con = g.GC["zypkjjccom"]["base"]
    _resList = []
    if _jifen <= _con['npcjifen']:
        _npcid = _con["npclist"]
        _npc = g.C.RANDLIST(_npcid, _refUserNum-len(_resList))
        _con = g.GC['other']['robot']
        _id = 0
        for npcid in _npc:
            _bossFightData = g.m.fightfun.getNpcFightData(npcid)
            _temp = {}
            _temp['uid'] = 'npc_{}'.format(_id)
            _temp['headdata'] = _bossFightData['headdata']
            _temp['headdata']['name'] = ''.join(g.C.RANDLIST(_con['firstname'])+g.C.RANDLIST(_con['sexname']))
            _temp['jifen'] = 1000
            _temp['zhanli'] = _bossFightData['zhanli']
            _temp['defhero'] = _bossFightData['herolist']
            _temp['_id'] = _id
            _id += 1
            _resList.append(_temp)
        return _resList

    # 先从缓存里面取
    _uidList = g.mc.get('zypkjjc_{}'.format(uid))
    if not _uidList:
        _resList,_set = [], []
        _wList = [
            {'jifen':{'$gte': _jifen-100, '$lte': _jifen+100}, 'defhero': {'$exists': 1}},
            {'jifen':{'$lt': _jifen-100}, 'defhero': {'$exists': 1}},
            {'jifen':{'$gte': _jifen}, 'defhero': {'$exists': 1}},
        ]
        for i in xrange(3):
            _w = _wList[i]
            _sort = [['jifen',-1]]
            if i == 2:
                _sort = [['jifen',1]]
            # if i == 0:
            #     _sort = []

            _data = g.mdb.find('zypkjjc', _w, sort=_sort, limit=_cacheNum - len(_resList))
            for i in _data:
                if i['uid'] in _set or i['uid'] == uid:
                    continue
                _set.append(i['uid'])
                _resList.append(i)

            if len(_resList) >= _cacheNum:
                # _resList = g.C.RANDLIST(_resList, _cacheNum)
                break
        # 返回3个对手
        _res = g.C.RANDLIST(_resList, _refUserNum)
        # 缓存十秒
        g.mc.set('zypkjjc_{}'.format(uid), map(lambda x:x['uid'], _resList), 10)
    else:
        _res = g.mdb.find('zypkjjc', {'uid':{'$in': g.C.RANDLIST(_uidList, _refUserNum)}})

    return _res


# 获取可以挑战的玩家列表-存在playattr中，每周可以自然刷新
def getPkUserList(uid):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_fightuser', 'k': _dKey}
    _res = g.getAttr(uid, _w)
    return _res


# 设置可以挑战的玩家列表
def setPkUserList(uid, ulist):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_fightuser'}
    for i in ulist:
        del i['_id']
    _data = {'v': ulist, 'k': _dKey}
    g.setAttr(uid, _w, data=_data)

# 获取用来发奖的数据
def getRankData():
    _data = g.mdb.find1('gameconfig', {'ctype': 'zypkjjc_rank', 'k': g.C.DATE(g.C.NOW())}, fields=['_id', 'v'])
    if not _data:
        _data = g.mdb.find('zypkjjc', sort=[['jifen', -1], ['zhanli', -1]],fields=['_id','uid','jifen'])
    else:
        _data = _data['v']
    return _data

# 发送每日奖励的事件
def timer_sendEveryPrize():
    # 获取积分排行
    _allUser = getRankData()
    # 循环发奖
    _emailList, _flagUid = [], []
    _con = dict(g.GC['zypkjjccom']['base']['email']['day'])
    _prizeConf = tuple(g.GC['zypkjjccom']['base']['dayprize']['prize'])
    
    _addEmailData = []
    for idx,i in enumerate(_allUser):
        _emailData = g.m.emailfun.fmtEmail(title = _con['title'],uid=i['uid'])
        _uid, _rank = i['uid'], idx + 1
        if _rank > 1000:
            break
        if _rank <= 32:
            _flagUid.append(_uid)
        _emailData['prize'] = getPrizeByRank(_rank, 'dayprize',con=_prizeConf)
        _emailData['content'] = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: (_rank, i['jifen'])})
        _addEmailData.append(_emailData)

    # 吊车尾奖励   一千名以后的
    if _allUser[1000:]:
        _addEmailData += [g.m.emailfun.fmtEmail(
            uid=i['uid'],prize=getPrizeByRank(1001, 'dayprize',con=_prizeConf),title=_con['title'],
            content=g.C.STR(_con['content'], '1000+')) for i in _allUser[1000:]]

    # 添加邮件
    g.mdb.insert('email', _addEmailData)
    # 战旗任务
    g.event.emit("FlagTask", _flagUid, '205')

    return _emailList

# 发送每周奖励的事件
def timer_sendWeekPrize():
    # 获取积分排行
    _allUser = g.mdb.find('zypkjjc', sort=[['jifen', -1], ['zhanli', -1]], fields=['_id','uid'])
    _con = dict(g.GC['zypkjjccom']['base']['email']['week'])
    _title = _con['title']
    # 循环发奖
    _emailList = []
    _addEmailData = []
    
    _prizeConf = tuple(g.GC['zypkjjccom']['base']['weekprize']['prize'])
    
    for idx,i in enumerate(_allUser):
        _emailData = g.m.emailfun.fmtEmail(title = _con['title'],uid=i['uid'])
        _uid, _rank = i['uid'], idx + 1
        if _rank > 1000:
            break
        _emailData['prize'] = getPrizeByRank(_rank, 'weekprize',con=_prizeConf)
        _emailData['content'] = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: _rank})
        _addEmailData.append(_emailData)

    # 吊车尾奖励   一千名以后的
    if _allUser[1000:]:
        _addEmailData += [g.m.emailfun.fmtEmail(
            uid=i['uid'],prize=getPrizeByRank(1001, 'weekprize',con=_prizeConf),title=_title,
            content=g.C.STR(_con['content'], '1000+')) for i in _allUser[1000:]]

    # 添加邮件
    g.mdb.insert('email', _addEmailData)
    return _emailList

# 根据排名获取奖励
def getPrizeByRank(rank, _type,con=None):
    if con:
        _con = con
    else:
        _con = g.GC['zypkjjccom']['base'][_type]['prize']
        
    if rank >= _con[-1][0][0]: return _con[-1][1]
    for i in _con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]


# 获取玩家积分
def getZypkjjcJifen(uid):
    _arenaInfo = getUserJJC(uid)
    # 说明是第一次打开
    if not _arenaInfo:
        return 1000
    return _arenaInfo['jifen']


# 记录玩家挑战数据
def setFightRecording(uid, enemyUid, data):
    data.update({
        'uid': uid,
        'enemyuid': enemyUid,
        'ctime': g.C.NOW(),
        'ttltime':g.C.TTL()
    })
    g.mdb.insert('zypkjjclog', data)


# 获取防守英雄站位信息
def getDefendHero(uid):
    _w = {'uid': uid}
    # 同区
    _data = g.mdb.find1('zypkjjc', _w)
    if not _data:
        _data = {}
    return _data.get('defhero', {})

# 获取防守阵容战力
def getDefendHeroZhanli(uid):
    _res = 0
    _w = {'uid': uid}
    _data = g.mdb.find1('zypkjjc', _w)
    if _data:
        _res = _data.get('zhanli', 0)
    return _res


# 检测放手英雄站位信息
def chkDefendHero(uid, tid=None):
    _data = g.mdb.find1('zypkjjc', {'uid':uid})
    if not _data:
        return
    _defHero = _data['defhero']
    _zhanli = _data['zhanli']
    if tid and tid not in _defHero.values():
        return
    _chkFightData = g.m.fightfun.chkFightData(uid, _defHero)
    if _chkFightData['chkres'] < 1:
        return
    if _zhanli == _chkFightData['zhanli']:
        return
    setUserJJC(uid,{'zhanli': _chkFightData['zhanli']})


# 获取积分改变情况
# jifen 我方积分  enemyJifen 对手积分   winside 为0 我方胜利  1：对手胜利
def getChangeJifen(jifen, enemyJifen, winside=0):
    K = getModulusByJifen(jifen)
    _enemyK = getModulusByJifen(enemyJifen)
    addJifen = int(K * (1 - 1 / (1 + 10 ** ((enemyJifen - jifen) / 400.0))))
    rmJifen = int(_enemyK * (0 - 1 / (1 + 10 ** ((jifen - enemyJifen) / 400.0))))
    if winside == 1:
        addJifen = int(K * (1 - 1.0 / (1 + 10 ** ((jifen - enemyJifen) / 400.0))))
        rmJifen = int(_enemyK * (0 - 1.0 / (1 + 10 ** ((enemyJifen - jifen) / 400.0))))

    return (addJifen, rmJifen)

#根据积分获取对应的系数
def getModulusByJifen(jifen):
    if jifen >= 0 and jifen < 800:
        K = 32
    elif jifen >= 800 and jifen < 1200:
        K = 64
    elif jifen >= 1200 and jifen < 1600:
        K = 32
    elif jifen >= 1600 and jifen < 1800:
        K = 16
    else:
        K = 8
    return K

# 监听新手引导 18级没有数据 就默认设置
def onNewPlayerGuide(uid, lv):
    if lv == 18:
        _heroList = g.m.herofun.getMyHeroList(uid,limit=6,sort=[['zhanli',-1],['lv',-1]],keys='zhanli')
        if not _heroList:
            return

        _fightData = {str(i+1):str(_heroList[i]['_id']) for i in xrange(len(_heroList))}
        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
        setUserJJC(uid,{'defhero': _fightData,'zhanli':_chkFightData['zhanli']})
    elif lv == 30:
        _userData = getUserJJC(uid, fields=['_id', 'defhero'])
        # 设置到跨区数据库中
        _chkFightData = g.m.fightfun.chkFightData(uid, _userData['defhero'],side=1)
        if _chkFightData['chkres'] < 1:
            return
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1)
        _data = g.m.crosscomfun.fmtCrossUserData(uid,_userFightData)
        _data['zhanli'] = _chkFightData['zhanli']
        _data['headdata'] = _data.pop('head')
        _data["headdata"] = g.m.userfun.getShowHead(uid)
        g.crossDB.update('jjcdefhero',{'uid':uid},_data,upsert=True)

# 获取排名
def getUserRank(uid, jifen, zhanli, rtype):
    _key = 'ZypkjjcRank' if rtype == 'zypkjjc' else 'ChampionTrialRank'
    _cacheRank = g.mc.get(_key)
    if _cacheRank and uid in _cacheRank['uid2rank']:
        return _cacheRank['uid2rank'][uid]
    
    _markjifen = g.m.rankfun.getRankJifen(rtype, 1000)
    if jifen >= _markjifen:
        return g.mdb.count(rtype, {'$or':[{'jifen': {'$gt': jifen}},{'jifen':jifen,'zhanli':{'$gt':zhanli}}]}) + 1
    else:
        return 1000

# 更新跨服数据
def updateCrossData(uid, tid):
    _fightData = getDefendHero(uid)
    if _fightData and tid in _fightData.values():
        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData,side=1)
        if _chkFightData['chkres'] < 1:
            return

        # 设置到跨区数据库中
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1, sqid=_fightData.get('sqid'))
        _userFightData.sort(key=lambda x: x.get('pos', 0))
        _data = g.m.crosscomfun.fmtCrossUserData(uid, _userFightData)
        _data['zhanli'] = _chkFightData['zhanli']
        _data['headdata'] = _data.pop('head')
        _data["headdata"] = g.m.userfun.getShowHead(uid)
        _data["headdata"]['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid'])
        g.crossDB.update('jjcdefhero', {'uid': uid}, _data, upsert=True)


#  设置防守阵容战力
def setDefendHero(uid):
    # 获取当前防守阵容的数据，更新
    _data = g.m.zypkjjcfun.getUserJJC(uid)
    _con = g.GC['zypkjjccom']['base']
    if not _data:
        _jifen = _con['initjifen']
        _zhanli = 0
        _defendData = {}

    else:
        _jifen = _data['jifen']
        _zhanli = _data.get('zhanli', 0)
        _defendData = _data.get('defhero', {})

    if not _defendData:
        return

    _chkFightData = g.m.fightfun.chkFightData(uid, _defendData, side=1)
    if _chkFightData['chkres'] < 1:
        return

    _newZhanli = _chkFightData['zhanli']
    _herolist = _chkFightData['herolist']

    # 战力改变在更新
    # if _zhanli != _newZhanli or _zhanli == 0:
    # 更新战力
    g.mdb.update('userinfo', {'uid': uid}, {'zhanli': _newZhanli})
    _gud = g.getGud(uid)
    _gud["zhanli"] = _newZhanli
    g.gud.setGud(uid, _gud)
    # 判断如果没有上阵英雄就不设置本服防守阵容
    if _newZhanli > 0 and len(_defendData) > 0 and _newZhanli > _zhanli:
        g.m.zypkjjcfun.setUserJJC(uid, {'defhero': _defendData, 'zhanli': _newZhanli})
    # 设置到跨区数据库中
    _userFightData = g.m.fightfun.getUserFightData(uid, _herolist, 1, sqid=_defendData.get('sqid'))
    _userFightData.sort(key=lambda x: x.get('pos', 0))
    _data = g.m.crosscomfun.fmtCrossUserData(uid, _userFightData, _herolist)
    g.crossDB.update('jjcdefhero', {'uid': uid}, _data, upsert=True)

    return _jifen, _newZhanli, _defendData



g.event.on('JJCzhanli', chkDefendHero)
g.event.on('dengjilibao', onNewPlayerGuide)
if __name__ == '__main__':
    uid = g.buid('xuzhao')
    # g.mc.flush_all()
    print setDefendHero('0_5cd38383c0911a3a94c3476b')