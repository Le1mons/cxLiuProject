#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g

'''
    删除好友印记赠送数据  月卡时间恢复   装备usenum 恢复
'''
print 'equip acction'
# 发送赛季排名奖励
g.mdb.update('shops',{'shopid':{'$in': ["7", '1']}}, {'autotime': g.C.NOW() + 2592000},RELEASE=1)
g.mdb.update('hero',{'hid':{'$in': ["61025", '61026']}}, {'normalskill': '20'},RELEASE=1)
g.mdb.delete('shops',{'shopid':'10'},RELEASE=1)

_all = g.mdb.find('flagtask',{'id':'303'})
for i in _all:
    _num = i['nval'] * 6
    g.mdb.update('flagtask',{'_id': i['_id']},{'nval': _num},RELEASE=1)

_all = g.mdb.find('buff')
for i in _all:
    g.m.ghkejifun.reSetBuff(i['uid'], '5')

print 'equip ok '
