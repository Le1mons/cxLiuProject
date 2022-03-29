#!/usr/bin/python
# coding:utf-8

'''
排行榜相关功能
'''
import g
from random import shuffle

# 获取工会数量
def getSignUpGuildNum(data):
    _num = g.crossMC.get('competing_guildnum')
    if not _num:
        _guilds = []
        for i in data.get('guild',{}):
            _guilds.extend(data['guild'][i])
        for i in data.get('after',{}):
            _guilds.extend(data['after'][i])
        for i in data.get('gh2uid',{}):
            _guilds.extend(data['gh2uid'][i])
        _num = len(_guilds)
        if _num >= g.GC['guildcompeting']['base']['cond']['guild_num']:
            _weekTime = g.C.getWeekFirstDay(g.C.NOW()) + 6 * 24 * 3600
            g.crossMC.set('competing_guildnum',_num,_weekTime - g.C.NOW())

    return _num

# 获取赛季轮数
def getRoundNum(season):
    _res = 1
    _data = g.crossDB.find1('competing_signup', {'season': season}, fields=['_id','round'])
    if _data:
        _res = _data.get('round', 1)

    return _res

# 判断本赛季是否开启
def isOpen(_season):
    _data = g.crossMC.get(g.C.STR('ghcompeting_{1}', _season))
    if _data is None:
        _data = g.crossDB.find1('competing_signup',{'season':_season},fields=['_id','open','guild'])
        if _data and _data.get('open'):
            _data = 1
            g.crossMC.set(g.C.STR('ghcompeting_{1}', _season), _data, g.C.getWeekFirstDay(g.C.NOW())+6*3600*24 - g.C.NOW())

    return _data

# 检查本公会是否可以报名
def isCanSignUpGame(ghid):
    _res = 0
    _season = getSeasonNum()
    # 先在main里面查  查到就说明已经匹配完毕 不能报名
    if g.crossDB.find1('competing_main', {'season': _season,'ghid':ghid}, fields={'_id':1}):
        return 0

    sid = str(g.getSvrIndex())
    _data = g.crossDB.find1('competing_signup',{'season':_season},fields=['_id','guild','matched','fail','after'])
    if not _data or \
            (ghid not in map(lambda x:x['ghid'],_data.get('guild',{}).get(sid, [])) and
             ghid not in map(lambda x:x['ghid'],_data.get('fail', {}).get(sid,[])) and
             ghid not in map(lambda x:x['ghid'],_data.get('after', {}).get(sid,[])) and
             ghid not in map(lambda x:x['ghid'],_data.get('matched', []))):
        _res = 1
    return _res

# 判断王者段位是否存在
def isKingExists(_season):
    _res = g.mc.get(g.C.STR('ghcompeting_king_{1}', _season))
    if _res is None:
        _res = g.crossDB.find1('competing_main',{'season':_season,'segment':4},fields={'_id':1})
        # 跨服数据库中有段位为4的公会
        if _res is not None:
            g.mc.set(g.C.STR('ghcompeting_king_{1}', _season), 1, g.C.getWeekFirstDay(g.C.NOW())+7*3600*24 - g.C.NOW())
    return _res

# 获取公会公会争锋的数据
def getCompetingData(ghid):
    _res = {}
    _nt = g.C.NOW()
    _con = g.GC['guildcompeting']['base']
    _season = getSeasonNum()
    _res['season'] = _season
    sid = str(g.getSvrIndex())
    _data = g.crossDB.find1('competing_signup',{'season': _season},fields=['_id'])
    if not _data:
        _data = {'guild':{},'round':1}
    # 星期天
    if g.C.WEEK() == 0: _season -= 1
    _res['round'] = _data.get('round', 1)
    _res['segmentdata'] = getSeasonData(ghid, _season)
    # 是否存在王者段位的公会
    _res['hadking'] = 1 if isKingExists(_season) else 0
    _guild = map(lambda x:x['ghid'],_data.get('guild',{}).get(sid, []))
    _matched = map(lambda x:x['ghid'], _data.get('matched',[]))
    _after = map(lambda x:x['ghid'],_data.get('after',{}).get(sid, []))
    _fail = map(lambda x:x['ghid'], _data.get('fail', {}).get(sid,[]))
    # 匹配失败
    if ghid in _fail and g.C.HOUR() >= 6:
        _res['status'] = 3
        _res['guildnum'] = _con['cond']['guild_num']
        _res['segmentdata']['topsegment'] = getXiuzhanTopSegment(_season, ghid)
    # 未报名
    elif ghid not in _guild and ghid not in _matched and ghid not in _after and ghid not in _fail:
        _res['status'] = 1
        # 公会数量
        _res['guildnum'] = getSignUpGuildNum(_data)
    # 已报名  没有打过的 0到6点  报名没有匹配的  星期天 匹配了0点到6点
    elif g.C.WEEK() == 0 or (ghid not in _data.get('settle', []) and 0<=g.C.HOUR()<6) or ghid not in _matched:
        _res['status'] = 2
        # 公会数量
        _res['guildnum'] = getSignUpGuildNum(_data)
    # 轮空
    elif _res['segmentdata'].get('lunkong') == 1:
        _res['status'] = 6
        _mainData = g.crossDB.find1('competing_main',{'ghid':ghid, 'season':_season},fields=['_id','pre_seg'])
        _res['pre_seg'] = _mainData.get('pre_seg',1) if _mainData else 1
        _res['segmentdata']['segment'] = _res['segmentdata']['segment'] + 1 if 6<=g.C.HOUR()<22 and _res['segmentdata']['segment']<4 else _res['segmentdata']['segment']
    # 开战时间
    elif g.C.ZERO(_nt)+_con['time']['fight'][0]<=_nt<=g.C.ZERO(_nt)+_con['time']['fight'][1]:
        _res['status'] = 5
        _res['guild'] = getGuildMembers(_season, ghid)
    # 结算期
    else:
        _res['status'] = 4
        _ghData = g.crossDB.find1('competing_main', {'season':_season,'ghid':ghid},fields=['_id','advance'])
        # 保级信息
        _res['advance'] = _ghData.get('advance', 0) if _ghData else 0
    return _res

# 获取参战的玩家
def getFighterByGhid(season, lst, ghid):
    _res = g.mc.get(g.C.STR('ghcompetinga_{1}_{2}', *lst))
    if not _res:
        _res = g.crossDB.find('competing_userdata',{'season':season,'ghid':{'$in': lst}},fields=['_id'])
        # 缓存至晚上十点
        g.mc.set(g.C.STR('ghcompetinga_{1}_{2}', *lst), _res, g.C.ZERO(g.C.NOW()) + 22*3600 - g.C.NOW())
    else:
        # 有残血状态的玩家
        _user = g.crossDB.find('competing_userdata',{'season':season,'ghid':{'$in': lst},'fightless':{'$exists':1}},fields=['_id','fightless','uid'])
        if _user:
            for i in _res:
                for x in _user:
                    if i['uid'] == x['uid']:
                        i['fightless'] = x['fightless']
    return _res

# 获取公会成员信息
def getGuildMembers(season, ghid):
    _data = g.crossDB.find('competing_main',{'season':season,'$or':[{'ghid':ghid},{'rival_ghid':ghid}]},fields={'_id':0,'rival_ghid':0,'group':0})
    # _all = g.crossDB.find('competing_userdata',{'season':season,'ghid':{'$in':map(lambda x:x['ghid'],_data)}},fields=['_id'])
    _all = getFighterByGhid(season, map(lambda x:x['ghid'],_data), ghid)
    _res = {}
    for i in _all:
        if i['ghid'] in _res:
            _res[i['ghid']]['player'].append(i)
        else:
            _res[i['ghid']] = {}
            _res[i['ghid']]['player'] = [i]
        del i['ghid']

    for i in _data:
        i['rank'] = g.crossDB.count('competing_main',{'season':season,'division':i['division'],'segment':i['segment'],
                                                      '$or':[{'jifen': {'$gt': i['jifen']}},{'jifen':i['jifen'],'zhanli':{'$gt':i['zhanli']}}]}) + 1
        _res[i.pop('ghid')].update(i)

    _zt = g.C.ZERO(g.C.NOW())
    # 获取使用的挑战次数
    _uidList = map(lambda x:x['uid'], _all)
    _used = g.mdb.find('playattr',{'uid':{'$in': _uidList},'ctype':'ghcompeting_usedfightnum','lasttime':{'$gte':_zt,'$lte':_zt+24*3600}},fields=['_id','v','uid'])
    _con = g.GC['guildcompeting']['base']
    _max = _con['atk_num']
    _used = {i['uid']: i['v'] for i in _used}

    # 对方的命数
    _life = g.crossDB.find('crossplayattr',{'ctype':'ghcompeting_lifenum','uid':{'$in':_uidList},'lasttime':{'$gte':_zt,'$lte':_zt+24*3600}},fields=['_id','v','uid'])
    _life = {i['uid']: i['v'] for i in _life}
    _maxLife = _con['life_num']

    for _ghid in _res:
        for i in _res[_ghid]['player']:
            i['atk_num'] = _max - _used.get(i['uid'], 0)
            i['life_num'] = _maxLife - _life.get(i['uid'], 0)

    return _res


# 获取赛季信息
def getSeasonData(ghid, season):
    _res = {'segment': 1,'rank':0,'jifen':0,'isjoin':0}
    _preSeasonInfo = g.crossDB.find1('competing_main', {'ghid': ghid, 'season': season}, fields=['_id'])
    if _preSeasonInfo:
        _res['segment'] = _preSeasonInfo['segment']
        # 王者段位不匹配赛区
        _w = {'$or':[{'jifen': {'$gt': _preSeasonInfo['jifen']}},{'jifen':_preSeasonInfo['jifen'],'zhanli':{'$gt':_preSeasonInfo['zhanli']}}],
              'segment': _res['segment'],'division':_preSeasonInfo['division'],'season':season}
        if _res['segment'] == 4:
            del _w['division']
            _w['$or'] = [{'alljifen': {'$gt': _preSeasonInfo['alljifen']}},{'alljifen':_preSeasonInfo['alljifen'],'zhanli':{'$gt':_preSeasonInfo['zhanli']}}]

        _res['rank'] = g.crossDB.count('competing_main',_w) + 1
        _res['jifen'] = _preSeasonInfo.get('jifen', 0)
        _res['lunkong'] = _preSeasonInfo.get('lunkong', 0)
        _res['topsegment'] = getTopSegment(ghid)
        _res['isjoin'] = 1

    return _res

# 本赛季历史最高段位
def getTopSegment(ghid):
    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _data = CATTR().getAttr(ghid, {'k': _dKey, 'ctype': {'$in': ['segmentprize_{}'.format(i) for i in xrange(2,5)]}}, fields=['_id', 'v'])
    return max(_data, key=lambda x: x['v'])['v'] if _data else 1

# 获取现在第几赛季
def getSeasonNum():
    # # 缓存一个星期
    # _num = g.crossMC.get('ghcompeting_season')
    # if not _num:
    # _expire = g.C.getWeekFirstDay(g.C.NOW()) + 6 * 24 * 3600 - g.C.NOW()
    # g.crossMC.set('ghcompeting_season', _num, _expire)
    _num = g.crossDB.count('crossconfig', {'ctype': 'competing_season'}) + 1
    # 周六22点就要插入数据 导致赛季加一  实际奖励是23点发  所以先减一
    if g.C.WEEK() == 6 and g.C.HOUR() >= 22:
        _num -= 1
    return _num

# 获取休战公会的最高段位
def getXiuzhanTopSegment(season, ghid):
    _data = g.crossDB.find1('competing_signup', {'season': season}, fields=['_id','fail'])
    sid = str(g.getSvrIndex())
    _res = 1
    if _data:
        for i in _data.get('fail', {}).get(sid, []):
            if i['ghid'] == ghid:
                _res = i.get('segment', 1)
                break
    return _res

# 匹配对手
def timer_matchGuild(guild, season):
    _con = g.GC['guildcompeting']['base']['matchcond']
    _svrList = g.m.crosscomfun.getServerData(1)['list']

    g.crossDB.delete('competing_main',{'season':season})
    _segment = {i: [] for i in xrange(1, 5)}
    for i in guild:
        _segment[i['segment']].append(i)

    _matched = []
    for k,guild in _segment.items():
        if not guild:
            continue

        # 按照开区顺序进行排序
        guild.sort(key=lambda x:_svrList.index(str(x['sid'])))
        # 分区 每50个公会一个区
        _division = partitionGuilds(guild, _con['division_num'])
        # 每个赛区之间随机交换十五个公会
        swapDivisionGuild(_division, _con['rand_num'])
        # 对每一个赛区进行分组
        groupingGuilds(_division, _con['group_num'])
        # 两两匹配对手 上传数据
        _set = uploadDivisionData(_division, season, k)
        _matched.extend(map(lambda x:{'ghid':x['ghid'],'guildinfo':x['guildinfo']}, _set))
    return _matched

# 匹配上传
def uploadDivisionData(data, season, segment):
    # 计算战力
    _all = g.crossDB.find('competing_userdata',{'season':season},fields=['_id','ghid','maxzhanli'])
    _gh2zhanli = {}
    for i in _all:
        _gh2zhanli[i['ghid']] = _gh2zhanli.get(i['ghid'], 0) + i['maxzhanli']

    _setData = []
    for division in data:
        _temp = {'season':season,'division':division,'ctime':g.C.NOW(),'segment':segment,'ttltime':g.C.TTL()}
        for group,ghlist in data[division].items():
            shuffle(ghlist)
            while len(ghlist) >= 2:
                _gh_1, _gh_2 = ghlist[:2]
                # 删除战力为0 没有userdata的公会
                if _gh2zhanli.get(_gh_1['ghid'],0) == 0 or _gh2zhanli.get(_gh_2['ghid'],0) == 0:
                    _failGH = _gh_1 if not _gh2zhanli.get(_gh_1['ghid']) else _gh_2
                    ghlist.remove(_failGH)
                    continue

                _gh_1.update(_temp)
                _gh_1.update({'rival_ghid':_gh_2['ghid'],'group':group,'jifen':0,'zhanli':_gh2zhanli.get(_gh_1['ghid'],0),
                              'alljifen':_gh_1.get('alljifen',0)})
                _gh_2.update(_temp)
                _gh_2.update({'rival_ghid':_gh_1['ghid'],'group':group,'jifen':0,'zhanli':_gh2zhanli.get(_gh_2['ghid'],0),
                              'alljifen':_gh_2.get('alljifen',0)})
                del ghlist[:2]
                _setData.extend([_gh_1, _gh_2])

            # 还有轮空的
            if len(ghlist) == 1:
                _gh = ghlist[0]
                _gh.update(_temp)
                _gh.update({'lunkong': 1,'jifen': 0,'zhanli':_gh2zhanli.get(_gh['ghid'],0),
                            'alljifen':_gh.get('alljifen',0)})
                insertSegmentPrize(_gh['ghid'], _temp['segment'] + 1 if _temp['segment']<4 else 4)
                _setData.append(_gh)

    g.crossDB.insert('competing_main', _setData)
    return _setData

# 给获胜公会增加积分
def addWinJifen(data):
    _con = g.GC['guildcompeting']['base']['segment']
    # 轮空积分
    _data = {i['ghid']: i for i in data}

    _res = []
    _black = []
    for ghid,v in _data.items():
        # 非轮空 并且之前处理过数据
        if 'lunkong' not in v and ghid not in _black and _data[ghid]['rival_ghid'] not in _black:
            _black.append(ghid)
            _rivalGH = _data[v['rival_ghid']]
            _data[ghid]['alljifen'] = _data[ghid].get('alljifen', 0) + _data[ghid]['jifen']
            _data[ghid]['pre_jifen'] = _data[ghid]['jifen']
            _data[v['rival_ghid']]['alljifen'] = _data[v['rival_ghid']].get('alljifen', 0) + _data[v['rival_ghid']]['jifen']
            _data[v['rival_ghid']]['pre_jifen'] = _data[v['rival_ghid']]['jifen']
            # 胜利公会加上获胜积分
            _gtGuild = max([v,_rivalGH], key=lambda x: (x['jifen'], x.get('zhanli', 0)))
            _data[_gtGuild['ghid']]['alljifen'] += _con[str(_gtGuild['segment'])]['win_jifen']
            _data[_gtGuild['ghid']]['pre_jifen'] += _con[str(_gtGuild['segment'])]['win_jifen']
        _res.append(v)

    return _res



# 每天的结算
def timer_dailySettlement(season):
    _mainData = g.crossDB.find('competing_main',{'season':season},fields=['_id'])
    # 增加获胜积分
    _mainData = addWinJifen(_mainData)

    _main = {i:[] for i in xrange(1,5)}
    for i in _mainData:
        _main[i['segment']].append(i)

    _advanceData = handleAdvanceData(_main)
    _setData, _settle = [], []
    for i in _advanceData:
        _setData.extend(_advanceData[i])
        for x in _advanceData[i]:
            _settle.append(x['ghid'])

    if _setData:
        g.crossDB.delete('competing_main',{'season':season})
        g.crossDB.insert('competing_main',_setData)

    return _settle

# 处理晋级数据
def handleAdvanceData(data):
    _data = data.copy()
    _res = {i:[] for i in xrange(1,5)}
    _con = g.GC['guildcompeting']['base']['segment']
    for segment,ghlist in _data.items():
        _division = {}
        # 分区分组
        for i in ghlist:
            # 轮空公会
            if i.get('lunkong') == 1:
                i['advance'] = 1
                i['pre_seg'] = i['segment']
                i['alljifen'] += _con[str(segment)]['lunk_integral']
                i['segment'] = i['segment'] + 1 if i['segment'] <4 else 4
                _res[i['segment']].append(i)
                continue
            if i['division'] not in _division:
                _division[i['division']] = {i['group']: [i]}
            else:
                if i['group'] not in _division[i['division']]:
                    _division[i['division']][i['group']] = [i]
                else:
                    _division[i['division']][i['group']].append(i)

        for division in _division:
            for group,lst in _division[division].items():
                lst.sort(key=lambda x:(x['jifen'],x['zhanli']),reverse=True)
                # 晋级
                if _con[str(segment)]['jinji'][0]:
                    for i in lst[:_con[str(segment)]['jinji'][0][1]]:
                        insertSegmentPrize(i['ghid'], segment + 1)
                        i['advance'] = 1
                        i['pre_seg'] = segment
                        i['segment'] = segment + 1
                    _res[segment + 1].extend(lst[:_con[str(segment)]['jinji'][0][1]])
                # 保级
                if _con[str(segment)]['jinji'][1]:
                    for i in lst[_con[str(segment)]['jinji'][1][0] - 1:_con[str(segment)]['jinji'][1][1]]:
                        i['advance'] = 0
                        i['pre_seg'] = i['segment']
                    _res[segment].extend(lst[_con[str(segment)]['jinji'][1][0] - 1:_con[str(segment)]['jinji'][1][1]])
                # 降级
                if _con[str(segment)]['jinji'][2]:
                    for i in lst[_con[str(segment)]['jinji'][2][0] - 1:_con[str(segment)]['jinji'][2][1] - 1]:
                        i['advance'] = -1
                        i['pre_seg'] = segment
                        i['segment'] = segment - 1
                    _res[segment - 1].extend(lst[_con[str(segment)]['jinji'][2][0] - 1:_con[str(segment)]['jinji'][2][1] - 1])

    return _res


# 分组
def groupingGuilds(division, num):
    for x in division:
        i = 1
        _group = {}
        while len(division[x]) >= num:
            _group[i] = division[x][:num]
            del division[x][:num]
            i += 1
        if division[x]:
            _group[i - 1 if i>1 else 1] = _group.get(i-1 if i>1 else 1, []) + division[x]
        division[x] = _group


# 对赛区之间进行交换对手
def swapDivisionGuild(division, num):
    _length = len(division)
    if _length == 1:
        return

    _rand1 = {}
    _rand2 = {}
    # 先随机出默认数量得公会
    for k in xrange(1, _length + 1):
        # 首尾赛区只交换一次
        _randGuilds = g.C.RANDLIST(division[k], num * 2 if 1 < k < _length else num)
        if k != _length:
            _rand1[k] = _randGuilds[:num]
            _rand2[k] = _randGuilds[num:]
        else:
            _rand1[k] = _randGuilds[num:]
            _rand2[k] = _randGuilds[:num]
        for i in _randGuilds:
            division[k].remove(i)

    # 进行合并
    for i in xrange(1, len(division)):
        division[i] += _rand2[i + 1]
        division[i + 1] += _rand1[i]


# 对公会进行分区 num 每个区得数量
def partitionGuilds(guilds, num):
    # 默认一个区
    _res = {}
    i = 1
    while len(guilds) >= num:
        _res[i] = guilds[:num]
        del guilds[:num]
        i += 1

    if guilds:
        _res[i - 1 if i>1 else 1] = _res.get(i-1 if i>1 else 1, []) + guilds
    return _res

# 获取当天可以挑战得次数
def getCanFightNum(uid):
    _max = g.GC['guildcompeting']['base']['atk_num']
    return _max - getUsedFightNum(uid)

# 获取已使用得挑战次数
def getUsedFightNum(uid):
    return g.getPlayAttrDataNum(uid, 'ghcompeting_usedfightnum')

# 设置使用挑战次数
def setUsedFightNum(uid):
    return g.setPlayAttrDataNum(uid, 'ghcompeting_usedfightnum')

# 获取剩下的得命数
def getLifeNum(uid):
    _max = g.GC['guildcompeting']['base']['life_num']
    return _max - getUsedLifeNum(uid)

# 获取消耗的得命数
def getUsedLifeNum(uid):
    return CATTR().getPlayAttrDataNum(uid, 'ghcompeting_lifenum')

# 设置剩余命数
def setUsedLifeNum(uid):
    return CATTR().setPlayAttrDataNum(uid, 'ghcompeting_lifenum')

# 发送赛季排名奖励
def timer_sendweekprize(season):
    sid = g.getSvrIndex()
    _ghDatas = g.crossDB.find('competing_main',{'season':season},fields=['_id','ghid','segment','alljifen','zhanli','sid'])
    _con = g.GC['guildcompeting']['base']
    _segmentData = fmtGuildRank(_ghDatas)

    _res = {}
    for segment in _segmentData:
        for rank,i in enumerate(_segmentData[segment]):
            if i['sid'] != sid:
                continue
            _prize = getPrizeByRank(rank + 1, _con['season_prize'][str(segment)])
            # 获取公会人员列表
            _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': i['ghid']}, fields=['_id', 'uid'])
            _allGhUser = [x['uid'] for x in _allGonghuiUser]
            # 过滤掉之前解散的公会
            if not _allGhUser:
                continue
            # 发送公会奖励邮件
            if segment == 4:
                _msg = g.C.STR(_con['season_email']['content1'], season,_con['segment'][str(segment)]['name'],rank+1)
            else:
                _msg = g.C.STR(_con['season_email']['content2'], season,_con['segment'][str(segment)]['name'])
            g.m.emailfun.sendEmails(_allGhUser, 1, _con['season_email']['title'], _msg,prize=_prize)
            _res[i['ghid']] = {'segment':segment,'prize':_prize}

    return _res

# 通过排行获取奖励
def getPrizeByRank(rank, con):
    for i in con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]

# 格式化公会数据
def fmtGuildRank(data):
    _res = {i:[] for i in xrange(1, 5)}
    for i in data:
        _res[i['segment']].append(i)

    for i in _res:
        _res[i].sort(key=lambda x:(x['alljifen'],x['zhanli']), reverse=True)
    return _res

# 上传uid
def uploadUidList(season, ghlist):
    # 匹配失败的公会
    _matched, _fail = [], []
    _con = g.GC['guildcompeting']['base']
    # 查找公会能参战的玩家_con['cond']['lv']
    _ghData = getCanFightUsers(ghlist, _con['cond']['lv'])
    for gh in ghlist:
        if gh['ghid'] not in _ghData:
            _fail.append(gh)
        elif len(_ghData[gh['ghid']]) < _con['cond']['player_num']:
            _fail.append(gh)
            del _ghData[gh['ghid']]
        else:
            _matched.append(gh)

    return _ghData,_fail,_matched

# 上传公会内满足条件得玩家 战斗数据
def mirrorUserFightData(season, _ghData):
    _setData, _uidList = [], []
    _uid2gh = {}
    for i in _ghData:
        _uidList.extend(_ghData[i])
        for uid in _ghData[i]:
            _uid2gh[uid] = i

    # 获取段位信息
    _gh2segment = getGuildsSegment(season, _ghData.keys())
    _ghData = {}
    _jjcUsers = g.crossDB.find('jjcdefhero', {'uid': {'$in': _uidList}}, fields={'_id':0,'lasttime':0})
    for i in _jjcUsers:
        ghid = _uid2gh[i['uid']]
        if ghid in _ghData:
            _ghData[ghid].append(i)
        else:
            _ghData[ghid] = [i]

    _ttl = g.C.TTL()
    for ghid in _ghData:
        _ghData[ghid].sort(key=lambda x: x.get('maxzhanli',0),reverse=True)
        _jifenList = getJifenList(str(_gh2segment[ghid]), len(_ghData[ghid]))
        for idx,i in enumerate(_ghData[ghid]):
            # 被杀积分
            i['lose_jifen'] = _jifenList[idx]
            i['ghid'] = ghid
            i['ttltime'] = _ttl
            i['season'] = season
            i['lasttime'] = g.C.NOW()
            _setData.append(i)

    if _setData:
        g.crossDB.delete('competing_userdata', {'season':season})
        g.crossDB.insert('competing_userdata', _setData)


# 获取积分列表
def getJifenList(segment, num):
    _con = g.GC['guildcompeting']['base']
    _modulus = _con['segment'][segment]['modulus'][:num]
    _jifen = _con['segment'][segment]['jifen_modulus']
    _base = sum(_modulus)
    _jifenList = []
    for idx in xrange(num):
        _jifenList.append(int(_modulus[idx] / float(_base) * _jifen))
    # 如果积分有细微得差距 就平衡一下
    _allJifen = sum(_jifenList)
    if _allJifen != _jifen:
        _jifenList[0] += _jifen - _allJifen

    return _jifenList


# 获取所有能参战的玩家
def getCanFightUsers(ghlist, lv):
    _res = []
    _ghUsers = g.mdb.find('gonghuiuser', {'ghid': {'$in': map(lambda x:x['ghid'], ghlist)}}, fields=['_id', 'uid', 'ghid'])
    # 过滤掉不满等级的玩家
    _allUser = g.mdb.find('userinfo',{'lv':{'$gte': lv},'uid':{'$in':map(lambda x:x['uid'], _ghUsers)}},fields=['_id','uid','maxzhanli'])
    for i in _ghUsers:
        for x in _allUser:
            if i['uid'] == x['uid']:
                _res.append({'uid':i['uid'],'ghid':i['ghid']})

    _ghData = {}
    for user in _res:
        if user['ghid'] in _ghData:
            _ghData[user['ghid']].append(user['uid'])
        else:
            _ghData[user['ghid']] = [user['uid']]
    return _ghData

# 获取公会段位的对照表
def getGuildsSegment(season, ghlist):
    # 默认青铜段位
    _res = {i: 1 for i in ghlist}
    _ghInfo = g.crossDB.find('competing_main', {'season': season, 'ghid': {'$in': ghlist}},
                             fields=['_id', 'segment', 'ghid'])
    for i in _ghInfo:
        _res[i['ghid']] = i['segment']

    return _res

# 增加段位奖励
def insertSegmentPrize(ghid, segment):
    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _data = CATTR().getAttrOne(ghid, {'k': _dKey, 'ctype': 'segmentprize_{}'.format(segment)},fields=['_id','uid'])
    if not _data:
        CATTR().setAttr(ghid, {'ctype': 'segmentprize_{}'.format(segment)},{'v':segment,'k': _dKey})

# 获取公会战斗信息
def getGuildFightInfo(ghid, season):
    # 只显示6点到次日六点的数据
    _zt = g.C.ZERO(g.C.NOW())
    _w = {'$or': [{'ghid':ghid},{'rival_ghid':ghid}],'ctime':{'$gte':_zt-18*3600,'$lte':_zt+6*3600}}
    if g.C.HOUR() >= 6:
        _w.update({'ctime': {'$gte':_zt+6*3600}})
    _data = g.crossDB.find('competing_fightdata',_w,sort=[['ctime',-1]],fields=['_id'])
    _res = {'mygh':[],'rival':[]}
    for i in _data:
        if i['ghid'] == ghid:
            _res['mygh'].append(i)
        else:
            _res['rival'].append(i)
    return _res

def CATTR():
    # 公会attr属性表
    return g.BASEDB(g.crossDB, 'playattr', 'crossplayattr')


if __name__ == '__main__':
    gh = g.mdb.find('gonghui',{},sort=[['lv',-1]],limit=10)
    _season = getSeasonNum()
    g.crossDB.update('competing_signup',{'season':_season},{'$push':{'guild.0':{'$each':map(lambda x:{'ghid':str(x['_id']),'guildinfo':{'name':x['name'],'flag':x['flag'],'chairman':'李易峰','svrname':g.m.crosscomfun.getSNameBySid(0)}}, gh)}}},upsert=True)