#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
# 发送赛季排名奖励
def timer_sendweekprize(season):
    sids = g.getSvrList()
    _ghDatas = g.crossDB.find('competing_main',{'season':season},fields=['_id','ghid','segment','alljifen','zhanli','sid'])
    _con = dict(g.GC['guildcompeting']['base'])
    _segmentData = g.m.competingfun.fmtGuildRank(_ghDatas)

    _res = {}
    for segment in _segmentData:
        for rank,i in enumerate(_segmentData[segment]):
            if i['sid'] not in sids:
                continue
            _prize = [{"a": "item","t": "2023","n": 300},{"a": "item","t": "2003","n": 3000},{"a": "attr","t": "jinbi","n": 5000000},{"a": "item","t": "1005","n": 1}]
            # 获取公会人员列表
            _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': i['ghid']}, fields=['_id', 'uid'])
            _allGhUser = [x['uid'] for x in _allGonghuiUser]
            # 过滤掉之前解散的公会
            if not _allGhUser:
                continue
            # 发送公会奖励邮件
            _msg = '由于服务器原因导致公会争锋奖励未发，在这里我们深表歉意，为此给各位勇士补发第一名奖励， 感谢您的理解与支持，祝您游戏愉快！'
            g.m.emailfun.sendEmails(_allGhUser, 1, '公会争锋补偿', _msg,prize=_prize)
            _res[i['ghid']] = {'segment':segment,'prize':_prize}

    return _res


all = g.mdb.find('playattr',{'ctype':'wangzhezhaomu_zhaomu','k':1600937770})
for i in all:
    _rec = []
    if g.mdb.find1('gamelog',{'uid':i['uid'],'type':'wangzhezhaomu_zhaomujifenprize','data.idx':0,'ctime':{'$gte':1601136000}}):
        _rec.append(0)
    if g.mdb.find1('gamelog',{'uid':i['uid'],'type':'wangzhezhaomu_zhaomujifenprize','data.idx':1,'ctime':{'$gte':1601136000}}):
        _rec.append(1)
    if _rec == i.get('jifenreclist', []):
        continue
    g.mdb.update('playattr',{'_id':i['_id']},{'jifenreclist':_rec},RELEASE=1)

# 增加赛季
if not g.crossDB.find1('crossconfig',{'ctype':'competing_season','ctime':1601128801}):
    g.crossDB.update('crossconfig', {'ctype': 'competing_season','ctime':1601128801},{'v':1},upsert=True)

_t = g.crossDB.find1('competing_signup',{'round':{"$eq":6}},sort=[['season',-1]],fields=['season'])
_season = _t['season']
if not g.mdb.find1('gameconfig',{'ctype':'competing_sendprize','season':_season}):
    _res = timer_sendweekprize(_season)

    g.mdb.update('gameconfig',{'ctype':'competing_sendprize'},{'v':_res,'ctime':g.C.NOW(),'season':_season},upsert=True)




print 'SUCCESS..............'
