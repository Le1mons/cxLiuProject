#!/usr/bin/python
#coding:utf-8

'''
冠军的试练相关功能
'''

import g
#获取每天免费挑战次数
def getFreePkNum(uid):
    _num = g.getPlayAttrDataNum(uid,'championtrial_freenum')
    return _num

#设置每天免费挑战次数
def setFreePkNum(uid):
    return g.setPlayAttrDataNum(uid, 'championtrial_freenum')

#获取每天可以免费挑战的次数
def getFreeCanPkNum(uid):
    _maxNum = g.GC['championtrial']['base']['freenum']
    _FreePkNum = getFreePkNum(uid)
    _canNum = _maxNum - _FreePkNum
    return _canNum

#获取玩家玩家的竞技场信息-方法中把要存的所有数据格式注释写出来**重要**
def getUserJJC(uid):
    # ['zhanli','jifen','uid','defhero','ctime]
    _w = {'uid': uid}
    _arenaInfo = g.mdb.find1('championtrial', _w)
    return _arenaInfo

#设置玩家竞技场信息
def setUserJJC(uid,data):
    _w = {'uid': uid}
    _nt = g.C.NOW()
    _temp = g.mdb.find1('championtrial',_w)
    if not _temp:
        _jifen = g.GC['championtrial']['base']['initjifen']
        _data = {
            'jifen': _jifen,
            'ctime':_nt,
            'lasttime':_nt,
            'uid':uid
        }
        _data.update(data)
        g.mdb.insert('championtrial', _data)
    else:
        data.update({'lasttime': _nt})
        g.mdb.update('championtrial',_w, data)

# 获取刷新对手的方法-本方法只根据规则刷新出对手
def refPkUser(uid):
    _cacheNum = 8
    # 需要刷新出来的玩家数量
    _refUserNum = 3
    # 先从缓存里面取
    _uidList = g.mc.get('championtrial_{}'.format(uid))
    if not _uidList:
        _jifen = g.m.championfun.getChampionJifen(uid)
        _resList, _set = [], []
        _wList = [
            {'jifen': {'$gte': _jifen - 100, '$lte': _jifen + 100}, 'defhero': {'$exists': 1}},
            {'jifen': {'$lt': _jifen - 100}, 'defhero': {'$exists': 1}},
            {'jifen': {'$gte': _jifen}, 'defhero': {'$exists': 1}},
        ]
        for i in xrange(3):
            _w = _wList[i]
            _sort = [['jifen', -1]]
            if i == 2:
                _sort = [['jifen', 1]]
            # if i == 0:
            #     _sort = []

            _data = g.mdb.find('championtrial', _w, sort=_sort, limit=_cacheNum - len(_resList))
            for i in _data:
                if i['uid'] in _set or i['uid'] == uid:
                    continue
                _set.append(i['uid'])
                _resList.append(i)

            if len(_resList) >= _cacheNum:
                # _resList = _resList[:_cacheNum]
                break

        # 返回3个对手
        _res = g.C.RANDLIST(_resList, _refUserNum)
        # 缓存十秒
        g.mc.set('championtrial_{}'.format(uid), map(lambda x:x['uid'], _resList), 10)
    else:
        _res = g.mdb.find('championtrial', {'uid':{'$in': g.C.RANDLIST(_uidList, _refUserNum)}})

    return _res


#发送每日奖励的事件
def timer_sendWeekPrize():
    #获取积分排行
    _allUser = g.mdb.find('championtrial',sort=[['jifen',-1],['zhanli',-1]],fields=['_id','uid'])
    # #存到gameconfig表
    # _data = {'ctype':'championtrial','v':_allUser}
    # g.m.gameconfigfun.db_addGameConfig(_data)
    #循环发奖
    _emailList = []
    _con = g.GC['championtrial']['base']['email']
    _addEmailData = []

    _prizeConf = tuple(g.GC['championtrial']['base']['weekprize'])
    for idx, i in enumerate(_allUser):
        _emailData = g.m.emailfun.fmtEmail(title=_con['title'],uid=i['uid'])
        _uid,_rank = i['uid'], idx + 1
        if _rank > 1000:
            break
        _emailData['prize'] = getPrizeByRank(_rank, 'dayprize', _prizeConf)
        _emailData['content'] = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: _rank})
        _addEmailData.append(_emailData)

    # 吊车尾奖励   一千名以后的
    if _allUser[1000:]:
        _addEmailData += [g.m.emailfun.fmtEmail(
            uid=i['uid'],prize=getPrizeByRank(1001, 'weekprize', _prizeConf),title=_con['title'],
            content=g.C.STR(_con['content'], '1000+')) for i in _allUser[1000:]]

    # 添加邮件
    g.mdb.insert('email', _addEmailData)
    return _emailList

# 根据排名获取奖励
def getPrizeByRank(rank, _type, con=None):
    if con:
        _con = con
    else:
        _con = g.GC['championtrial']['base']['weekprize']

    if rank >= _con[-1][0][0]: return _con[-1][1]
    for i in _con:
        _min,_max = i[0]
        if _min <= rank <= _max:
            return i[1]

#获取可以挑战的玩家列表-存在playattr中，每周可以自然刷新
def getPkUserList(uid):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'championtrial_fightuser','k':_dKey}
    _res = g.getAttr(uid, _w)
    return _res

#设置可以挑战的玩家列表
def setPkUserList(uid,ulist):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'championtrial_fightuser'}
    _data = {'v': ulist,'k':_dKey}
    g.setAttr(uid, _w, data=_data)

# 获取玩家积分
def getChampionJifen(uid):
    _arenaInfo = getUserJJC(uid)
    # 说明是第一次打开
    if not _arenaInfo:
        _nt = g.C.NOW()
        _jifen = g.GC['championtrial']['base']['initjifen']
        # setUserJJC(uid,{'jifen':_jifen,'lasttime':_nt})
        return _jifen
    return _arenaInfo['jifen']

# 获取防守英雄站位信息
def getDefendHero(uid):
    _w = {'uid': uid}
    _data = g.mdb.find1('championtrial',_w)
    if not _data:
        return []
    return _data.get('defhero',[])


# 记录玩家挑战数据
def setFightRecording(uid, enemyUid, fightres,jifenInfo,jifenChange):
    _data = {
        'uid':uid,
        'enemyuid':enemyUid,
        'fightres':fightres,
        'ctime':g.C.NOW(),
        'jifenchange':jifenChange,
        "jifeninfo":jifenInfo,
        'ttltime':g.C.TTL()
    }
    g.mdb.insert('ctlog', _data)


# 检测冠軍放手英雄站位信息
def chkCTdefendHero(uid):
    _w = {'uid': uid}
    _data = g.mdb.find1('championtrial', _w)
    if not _data:
        return

    _defheros = _data.get('defhero', [])
    if len(_defheros) == 0:
        return

    _whereObject = []
    _sq = {}
    for idx,i in enumerate(_defheros):
        _teamList = []
        for x in i:
            if x == 'sqid':
                _sq[str(idx)] = i['sqid']
                continue
            elif x=='pet':
                continue
            _teamList.append(i[x])
        _whereObject += _teamList

    _whereObject = map(g.mdb.toObjectId, _whereObject)
    _heroList = g.mdb.find('hero', {'_id': {'$in': _whereObject}}, fields=['hid'])
    if len(_heroList) == len(_whereObject):
        return

    _chkHeroTid = map(lambda x: str(x['_id']), _heroList)
    _defheroList = []
    _zhanli = 0
    for idx,_defhero in enumerate(_defheros):
        _saveData = {}
        for pos, tid in _defhero.items():
            if tid not in _chkHeroTid:
                continue
            _saveData[pos] = tid
        if str(idx) in _sq:
            _saveData['sqid'] = _sq[str(idx)]
        _defheroList.append(_saveData)
        _chkFightData = g.m.fightfun.chkFightData(uid, _saveData)
        if _chkFightData['chkres'] < 1:
            return
        _zhanli += _chkFightData['zhanli']

    if not _defheroList:
        g.mdb.delete('championtrial', {'uid': uid})
    else:
        g.mdb.update('championtrial',{'uid':uid},{'defhero': _defheroList,'zhanli':_zhanli})

# 获取积分改变情况
# jifen 我方积分  enemyJifen 对手积分   winside 为0 我方胜利  1：对手胜利
def getChangeJifen(jifen, enemyJifen, winside=0):
    K = g.m.zypkjjcfun.getModulusByJifen(jifen)
    _enemyK = g.m.zypkjjcfun.getModulusByJifen(enemyJifen)
    addJifen = int(K * (1 - 1 / (1 + 10 ** ((enemyJifen - jifen) / 400.0))))
    rmJifen = int(_enemyK * (0 - 1 / (1 + 10 ** ((jifen - enemyJifen) / 400.0))))
    if winside == 1:
        addJifen = int(K * (1 - 1.0 / (1 + 10 ** ((jifen - enemyJifen) / 400.0))))
        rmJifen = int(_enemyK * (0 - 1.0 / (1 + 10 ** ((enemyJifen - jifen) / 400.0))))

    return (addJifen, rmJifen)

# 监听冠军试炼上阵英雄属性变化
def chkCTzhanli(uid, tid=None):
    _data = g.mdb.find1('championtrial', {'uid':uid})
    if not _data:
        return
    _defHero = _data.get('defhero',[])
    if not _defHero:
        return
    _preZhanli = _data.get('zhanli',0)
    _allTid = []
    _zhanli = 0
    for i in _defHero:
        _chkFightData = g.m.fightfun.chkFightData(uid, i)
        if _chkFightData['chkres'] < 1:
            return
        _zhanli += _chkFightData['zhanli']
        _allTid.extend(i.values())
    if tid and tid not in _allTid:
        return
    if _preZhanli == _zhanli:
        return
    setUserJJC(uid,{'zhanli': _zhanli})

# 检查重复英雄
def checkRepeatHero(_teamData):
    _team1Data = _teamData[0].values()
    _team2Data = _teamData[1].values()
    _team3Data = _teamData[2].values()
    # 有重复的英雄
    if set(_team1Data)&set(_team2Data)\
        or set(_team1Data)&set(_team3Data)\
        or set(_team3Data)&set(_team2Data):
        return False
    return True

g.event.on('GJherofenjie', chkCTdefendHero)
g.event.on('JJCzhanli', chkCTzhanli)

if __name__ == '__main__':
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    print _dKey