#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    更改玩家跨服战斗数据
'''
print 'activation  start ...'
_all = g.mdb.find('userinfo',{},fields=['_id','uid'])
for x in _all:
    uid = x['uid']
    _data = {'star': 10, 'dengjielv': 10, 'dengjie': 6, 'lv': 255}
    for hid in ('14046', '45046', '34026', '14036', '25076', '24036'):
        g.m.herofun.addHero(uid, hid, _data)
print 'OK'
