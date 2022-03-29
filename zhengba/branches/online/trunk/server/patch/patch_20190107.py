#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'

season = g.m.competingfun.getSeasonNum() - 1
_tmep = g.mdb.find1('gameconfig', {'ctype': 'competing_sendprize', 'season': season})
if not _tmep:
    _flag = False

    sid = g.getSvrIndex()
    _ghDatas = g.crossDB.find('competing_main', {'season': season},
                              fields=['_id', 'ghid', 'segment', 'alljifen', 'zhanli', 'sid'])
    _con = g.GC['guildcompeting']['base']
    _segmentData = g.m.competingfun.fmtGuildRank(_ghDatas)

    _res = {}
    for segment in _segmentData:
        for rank, i in enumerate(_segmentData[segment]):
            if i['sid'] != sid:
                continue
            _prize = g.m.competingfun.getPrizeByRank(rank + 1, _con['season_prize'][str(segment)])
            # 获取公会人员列表
            _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': i['ghid']}, fields=['_id', 'uid'])
            _allGhUser = [x['uid'] for x in _allGonghuiUser]
            # 过滤掉之前解散的公会
            if not _allGhUser:
                _flag = True
                continue
            if not _flag:
                continue
            # 发送公会奖励邮件
            if segment == 4:
                _msg = g.C.STR(_con['season_email']['content1'], season, _con['segment'][str(segment)]['name'],
                               rank + 1)
            else:
                _msg = g.C.STR(_con['season_email']['content2'], season, _con['segment'][str(segment)]['name'])
            g.m.emailfun.sendEmails(_allGhUser, 1, _con['season_email']['title'], _msg, prize=_prize)
            _res[i['ghid']] = {'segment': segment, 'prize': _prize}

    g.mdb.update('gameconfig',{'ctype':'competing_sendprize','season':season},{'v':_res},upsert=True)
print 'ok...............'