#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
start = g.C.NOW()
_all = g.mdb.find('userinfo',{'lv':{'$gt':10}},fields=['_id','uid'])
for i in _all:
    g.m.herofun.reSetAllHeroBuff(i['uid'],{'lv':{'$gt':1}})
print u'耗费时间',g.C.NOW() - start
print 'ok...............'