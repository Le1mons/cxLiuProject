#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_season = g.crossDB.count('crossconfig', {'ctype': 'competing_season'})
_res = g.m.competingfun.timer_sendweekprize(_season)

g.mdb.update('gameconfig',{'ctype':'competing_sendprize','season':_season},{'v':_res},upsert=True)

print 'ok...............'