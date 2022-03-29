#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g,config,time

'''
    更新装备
'''
print 'start..................'
_season = g.m.competingfun.getSeasonNum()
_all = g.crossDB.find('competing_main', {'season':_season})
for i in _all:
    if not g.crossDB.find('competing_userdata',{'ghid':i['ghid'],'season':_season}):
        g.crossDB.update('competing_userdata',{'ghid':i['ghid'],'season':_season - 1},{'season':_season})


print 'ok...............'