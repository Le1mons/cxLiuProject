#!/usr/bin/python
#coding:utf-8

'''
五军之战
'''
import g

# 获取主数据
def getMainData(uid):
    _res = {}
    _con = g.GC['five_army']['base']
    _nt = g.C.NOW()
    _res['signnum'] = getSignUpNum()
    _res['signup'] = chkUserIsSignUp(uid)
    # 非报名期间 并且已经报名了
    if 24*3600 <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['not_signup'][1] and _res['signup']:
        _key = getSeasonNum()
        _data = g.crossDB.find1('wjzz_data',{'key':_key,'uid':uid},fields=['_id','num','group','faction'])
        _res['data'] = _data
        # 最强
        _res['strongest'] = g.crossDB.find1('wjzz_data',{'key':_key,'group':_data['group'],'num':{'$gt':0}},sort=[['num',-1],['lasttime',1]],fields=['_id','headdata','num'])
        # 阵营的部队数量和水晶伤害
        _res['faction'] = g.crossDB.find('wjzz_crystal',{'group':_data['group'],'key':_key},fields=['_id','num','team','faction','live'])
        # 英雄的状态和疲劳
        _status = g.getAttrByDate(uid, {'ctype': 'wjzz_status'}) or [{}]
        _res['pilao'], _res['status'] = _status[0].get('pilao', {}), _status[0].get('v', {})

    return _res

# 获取报名人数
def getSignUpNum():
    _season = getSeasonNum()
    _res = g.crossMC.get('wjzz_signupNum_{}'.format(_season))
    if _res is None:
        _res = g.crossDB.count('wjzz_signup', {'key': _season})
        if _res >= g.GC['five_army']['base']['open']:
            g.crossMC.set('wjzz_signupNum_{}'.format(_season), _res, 24*3600)
        # 周一22点到周五24点
        elif (g.C.WEEK() == 1 and g.C.HOUR()>=22) or g.C.WEEK() in (2,3,4,5):
            g.crossMC.set('wjzz_signupNum_{}'.format(_season), _res, g.C.ZERO(g.C.NOW()+24*3600)-g.C.NOW())

    return _res

# 判断是否已经报名了
def chkUserIsSignUp(uid):
    _nt = g.C.NOW()
    _key = getSeasonNum()
    _res = g.mc.get('wjzz_signup_{0}_{1}'.format(uid,_key))
    if _res is None:
        _res = g.crossDB.count('wjzz_signup',{'uid':uid,'key':_key})
        if _res == 1:
            # 缓存至周末
            g.mc.set('wjzz_signup_{0}_{1}'.format(uid,_key), 1, g.C.ZERO(_nt+24*3600)-_nt)
    return _res

# 获取赛季
def getSeasonNum():
    _data = g.crossDB.find1('crossconfig', {'ctype': 'wjzz_season'})
    _res = 1
    if _data:
        _res = _data['v'] + 1

    return _res

# 设置数据
def setFightData(uid, data, fight, remove=False):
    ttl = g.C.TTL()
    _key = getSeasonNum()

    _groupData = {}
    # 如果已经分组了
    _data = getUserData(uid)
    if _data:
        _groupData['group'] = _data['group']
        _groupData['faction'] = _data['faction']

    _insert = []
    for team, hlist in fight.items():
        _temp = {'uid': uid, 'team': team + 1, 'key': _key, 'ttltime': ttl}
        _temp.update(_groupData)
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, hlist, 1, sqid=data[team].pop('sqid',None))
        _temp['data'] = _userFightData
        _insert.append(_temp)

    # 添加预备役数据
    if remove:
        g.crossDB.delete('wjzz_reserve',{'uid': uid})
    g.crossDB.insert('wjzz_reserve', _insert)

# 根据排行获取奖励
def getRankPrize(rank, con):
    for i in con:
        if i[0] <= rank <= i[1]:
            return i[2]


# 检查英雄是否合格
def chkFightData(uid, data):
    _res = {}
    _tids = []
    _con = g.GC['five_army']['base']
    for i in data:
        _tids.extend([i[x] for x in i if x != 'sqid'])
    _heros = g.mdb.find('hero',{'uid':uid,'_id':{'$in':map(g.mdb.toObjectId, _tids)},'star':{'$gte':_con['star']}})
    # 有英雄不够8星
    if len(_tids) != len(_heros):
        _res['s'] = -20
        _res['errmsg'] = g.L('wjzz_signup_-20')
        return _res

    for idx,i in enumerate(data):
        # 不满六个人
        if len(i) < 6 or ('sqid' in i and len(i) < 7):
            _res['s'] = -21
            _res['errmsg'] = g.L('wjzz_signup_-21')
            return _res

        _res[idx] = []
        for hero in _heros:
            for x in i:
                hero['_id'] = str(hero['_id'])
                if i[x] == hero['_id']:
                    _res[idx].append(hero)
                    break

    for team in _res:
        # 检查战斗参数
        _chkFightData = g.m.fightfun.chkFightData(uid, data[team], herodata=_res[team], side=1)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res

        _res[team] = _chkFightData['herolist']

    return _res


# 定时器分组逻辑
def timer_Group():
    return
    _key = getSeasonNum()
    _all = g.crossDB.find('wjzz_signup',{'key':_key},fields={'_id':0,'ttltime':0},sort=[['ctime',1]])
    _length = len(_all)
    _con = g.GC['five_army']['base']
    # 没有开启
    if _length < _con['open']:
        return

    _gId = 1
    _group = {_gId: []}
    while _length >= _con['group']:
        _users = _all[:_con['group']]
        g.C.SHUFFLE(_users)
        _group[_gId] = _users
        del _all[:_con['group']]
        _gId += 1
        _length -= _con['group']

    # 多余的人并到上一组
    if _length > 0:
        _group[_gId - 1 if _gId != 1 else _gId] += _all

    _gId = len(_group) + 1
    # 超过一组交换
    if _gId - 1 > 1:
        _swap = {}
        for i in _group:
            # 第一组和最后一组只取50人
            if i in (1, _gId - 1):
                _num = _con['swap']
            else:
                _num = _con['swap'] * 2
            _swap[i] = _group[i][:_num]
            del _group[i][:_num]

        # 开始交换各个区选出来的人
        for i in xrange(1, _gId):
            if i  == 1:
                _group[i] += _swap[2][:_con['swap']]
                del _swap[2][:_con['swap']]
            elif i == _gId - 1:
                _group[i] += _swap[_gId - 2][:_con['swap']]
                del _swap[_gId - 2][:_con['swap']]
            # 加上前面一组和后面一组各50个
            else:
                _group[i] += _swap[i-1][:_con['swap']]
                del _swap[i-1][:_con['swap']]
                _group[i] += _swap[i+1][:_con['swap']]
                del _swap[i+1][:_con['swap']]

    _res = []
    ttl = g.C.TTL()

    _factions = {i:{'1':[],'2':[],'3':[],'4':[],'5':[]} for i in xrange(1, _gId)}
    # 开始分阵营
    for group,users in _group.items():
        users.sort(key=lambda x:x['zhanli'], reverse=True)
        _userLen = len(users)
        while _userLen > 0:
            _faction = ['1', '2', '3', '4', '5']
            g.C.SHUFFLE(_faction)
            for i in xrange(5):
                users[i]['faction'] = _faction.pop()
                users[i]['group'] = group
                users[i]['lasttime'] = g.C.NOW()
                users[i]['num'] = 0
                users[i]['ttltime'] = ttl

                _factions[group][users[i]['faction']].append(users[i]['uid'])
                _userLen -= 1
                if _userLen <= 0:
                    break
            _res += users[:5]
            del users[:5]

    # 给预备役设置阵营和组
    for group in _factions:
        for faction,uidlist in _factions[group].items():
            g.crossDB.update('wjzz_reserve',{'uid':{'$in': uidlist},'key':_key}, {'faction':faction,'group':group})

    g.crossDB.insert('wjzz_data', _res)

    # 记录驻防部队数量
    _faction2num = {i: {'1':0,'2':0,'3':0,'4':0,'5':0} for i in xrange(1, _gId)}
    _all = g.crossDB.find('wjzz_reserve', {'key': _key}, fields=['_id'])
    for i in _all:
        for group,faction in _factions.items():
            for x in faction:
                if i['uid'] in faction[x]:
                    _faction2num[group][x] += 1
                    break

    _crystal = []
    for group in _faction2num:
        for faction, num in _faction2num[group].items():
            _crystal.append({
                "ttltime":ttl,
                "faction":faction,
                "group":group,
                "team":num,
                "live":num,
                "integral":0,
                "sumlive":0,
                "num": 0,
                "sumdps": 0,
                "key":_key
            })
    # 水晶数据
    g.crossDB.insert('wjzz_crystal',_crystal)

    # 添加驻防部队
    g.crossDB.insert('wjzz_defend', _all)

# 获取对手uid
def getRival(uid, faction, ref=False):
    _res = {}
    _season = getSeasonNum()
    _data = getUserData(uid)
    if not ref:
        _res = g.mdb.find1('wjzz_rival',{'myuid':uid,'faction':faction,'key':_season,'group':_data['group']},fields=['_id'])
    else:
        _res = False
    if not _res:
        # 对方阵营没有死的
        _res = g.crossDB.find1_rand('wjzz_defend',{'group':_data['group'],'faction':faction,'dead':{'$exists':0},'key':_season},fields=['_id','uid','team'])
        if not _res:
            g.mdb.delete('wjzz_rival',{'myuid':uid,'faction':faction,'key':_season})
            return {'res': False}

        g.mdb.update('wjzz_rival',{'myuid': uid,'faction':faction}, {'uid': _res['uid'],'key':_season,'group':_data['group'],'team':_res['team']},upsert=True)

    _res = g.crossDB.find1('wjzz_defend',{'group':_data['group'],'faction':faction,'team':_res['team'],'uid':_res['uid']},fields=['_id','data','status','dead','uid','team'])
    try:
        _headdata = g.crossDB.find1('wjzz_data', {'uid': _res['uid'], 'key': _season}, fields=['_id', 'headdata'])
    except:
        return getRival(uid, faction, True)
    _res.update(_headdata)

    return _res

# 获取我的阵营和组
def getUserData(uid):
    _season = getSeasonNum()
    _res = g.mc.get('wjzz_data_{0}_{1}'.format(uid, _season))
    if not _res:
        _res = g.crossDB.find1('wjzz_data',{'key':_season,'uid':uid},fields=['_id','group','faction','num'])
        g.mc.set('wjzz_data_{0}_{1}'.format(uid, _season), _res, g.C.ZERO(g.C.NOW()+24*3600)-g.C.NOW())
    return _res

# 获取红点
def getHongDian(uid):
    _res = 0
    return {'wjzz': _res}
    _con = g.GC['five_army']['base']
    # 开区天数不足 等级不足
    if g.getOpenDay() < _con['openday'] or not g.chkOpenCond(uid, 'wjzz'):
        return {'wjzz': _res}

    _nt = g.C.NOW()
    # 战斗期
    if _con['time']['not_signup'][0] <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['not_signup'][1]:
        # 报名并且开启了 每天一次
        if chkUserIsSignUp(uid) and g.crossDB.find1('wjzz_crystal',{'key': getSeasonNum()}) and not g.getAttrByDate(uid,{'ctype':'wjzz_dailyhd'}):
            _res = 1
    # 周六0点到周一22点报名
    else:
        if not chkUserIsSignUp(uid):
            _res = 1
    return {'wjzz': _res}

# getayn使用 是否可以参加活动
def chkWjzzData(uid):
    _res = False
    return _res
    _con = g.GC['five_army']['base']
    _nt = g.C.NOW()
    # 战斗期
    if _con['time']['not_signup'][0] <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['not_signup'][1]:
        # 报名并且开启了 每天一次
        if chkUserIsSignUp(uid) and g.crossDB.find1('wjzz_crystal',{'key': getSeasonNum()}):
            _res = True

    return _res

if __name__ == '__main__':
    g.crossMC.flush_all()
    # print getMainData(g.buid('xuzhao'))