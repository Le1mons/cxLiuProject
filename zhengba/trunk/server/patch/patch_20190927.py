#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'
g.mdb.delete('gameconfig',{'ctype':'competing_sendprize'},RELEASE=1)
_all = g.mdb.find('userinfo')
for i in _all:
    _num = g.mdb.count('hero',{'uid':i['uid'],'star':{'$gte': 13}})
    if _num >= 2:
        g.mdb.update('userinfo', {'uid':i['uid']}, {'resonance': 1},RELEASE=1)
g.mdb.delete('shops',{'shopid': '10'})

print 'OK'


