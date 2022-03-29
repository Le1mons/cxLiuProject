#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g,config,time

'''
    更新装备
'''
print 'start..................'
# if config.CONFIG['VER'] == 'cross':
_season = g.crossDB.count('crossconfig', {'ctype': 'competing_season'}) + 1
# _round = g.m.competingfun.getRoundNum(_season)
# _round = 1 + _round if _round < 6 else 6
_settle = g.m.competingfun.timer_dailySettlement(_season)
# g.crossDB.update('competing_signup',{'season':_season},{'round':_round,'settle': _settle})

if g.C.getWeek() == 0:
    # 增加王者风范
    _top = g.crossDB.find('competing_main', {'season': _season, 'segment': 4}, sort=[['alljifen', -1], ['zhanli', -1]],
                          limit=3, fields=['_id', 'name', 'guildinfo', 'season', 'zhanli','ghid'])
    if _top:
        g.crossDB.insert('competing_toplog', _top)

    g.crossDB.insert('crossconfig', {'k': _season, 'ctype': 'competing_season', 'v': 1, 'ctime': g.C.NOW()})
# else:
#     time.sleep(10)
#     _season = g.crossDB.count('crossconfig', {'ctype': 'competing_season'})
#     _res = g.m.competingfun.timer_sendweekprize(_season)
#     g.mdb.update('gameconfig', {'ctype': 'competing_sendprize', 'season': _season}, {'v': _res}, upsert=True)

print 'ok...............'