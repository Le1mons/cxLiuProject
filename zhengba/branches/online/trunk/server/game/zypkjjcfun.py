#!/usr/bin/python
# coding:utf-8

'''
自由竞技场相关功能
'''

import g


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
    # 需要刷新出来的玩家数量
    _refUserNum = 3
    _jifen = getZypkjjcJifen(uid)
    _wList = [
        {'$gte': _jifen-100, '$lte': _jifen+100},
        {'$gte': 800, '$lte': _jifen-100},
        {'$lte': 1100}
    ]
    _resList = []
    _black = [uid]
    for i in xrange(3):
        _enemyList = []
        for j in xrange(3):
            _w = {'jifen': _wList[j], 'uid': {"$nin": _black}, 'defhero': {'$exists': 1}}
            if j == 1:
                _enemyList = g.mdb.find('zypkjjc', _w, sort=[['jifen',-1]],limit=_refUserNum - len(_resList))
            else:
                _enemyList = g.mdb.find('zypkjjc', _w)
            if _enemyList:
                break
        _black += [i['uid'] for i in _enemyList]
        # 随机出三个对手
        _randEnemy = g.C.RANDLIST(_enemyList, _refUserNum - len(_resList))
        _resList += _randEnemy
        if len(_resList) == 3:
            return _resList

    return _resList


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


# 发送每日奖励的事件
def timer_sendEveryPrize():
    # 获取积分排行
    _allUser = g.mdb.find('zypkjjc', sort=[['jifen', -1], ['lasttime', 1]],fields=['_id','uid'])
    # 循环发奖
    _emailList = []
    _con = g.GC['zypkjjccom']['base']['email']['day']
    _title = _con['title']
    for idx,i in enumerate(_allUser):
        _uid, _rank = i['uid'], idx + 1
        if _rank > 1000:
            break
        _prize = getPrizeByRank(_rank, 'dayprize')
        _content = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: _prize})
        g.m.emailfun.sendEmails([_uid], 1, _title, _content, _prize)

    # 吊车尾奖励   一千名以后的
    _uidList = map(lambda x:x['uid'], _allUser[1000:])
    if _uidList:
        g.m.emailfun.sendEmails(_uidList, 1, _title, g.C.STR(_con['content'], '1000+'), getPrizeByRank(1001, 'dayprize'))
        _emailList.append({'after1000': _uidList})

    return _emailList

# 发送每周奖励的事件
def timer_sendWeekPrize():
    # 获取积分排行
    _allUser = g.mdb.find('zypkjjc', sort=[['jifen', -1], ['lasttime', 1]], fields=['_id','uid'])
    _con = g.GC['zypkjjccom']['base']['email']['week']
    _title = _con['title']
    # 循环发奖
    _emailList = []
    for idx,i in enumerate(_allUser):
        _uid, _rank = i['uid'], idx + 1
        if _rank > 1000:
            break
        _prize = getPrizeByRank(_rank, 'weekprize')
        # g.getPrizeRes(_uid, _prize)
        _content = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: _rank})
        g.m.emailfun.sendEmails([_uid], 1, _title, _content, _prize)

    # 吊车尾奖励   一千名以后的
    _uidList = map(lambda x:x['uid'], _allUser[1000:])
    if _uidList:
        g.m.emailfun.sendEmails(_uidList, 1, _title, g.C.STR(_con['content'], '1000+'), getPrizeByRank(1001, 'weekprize'))
        _emailList.append({'after1000': _uidList})
    return _emailList

# 根据排名获取奖励
def getPrizeByRank(rank, _type):
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
        _chkFightData = g.m.fightfun.chkFightData(uid, _userData['defhero'])
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1)
        _data = g.m.crosscomfun.fmtCrossUserData(uid,_userFightData)
        _data['headdata'] = _data.pop('head')
        g.crossDB.update('jjcdefhero',{'uid':uid},_data,upsert=True)

g.event.on('JJCzhanli', chkDefendHero)
g.event.on('dengjilibao', onNewPlayerGuide)
if __name__ == '__main__':
    uid = g.buid('xuzhao')