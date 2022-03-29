#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
a = g.mdb.find1('gameconfig',{'k':'2018-44','ctype':'crosszb_zbprize'})
v = a['v']
uidList = map(lambda x:x.keys()[0], v)
_con = g.m.crosszbfun.getCon()
_title = _con['zhengba']['email']['title']
_content = _con['zhengba']['email']['content']
sid = g.getSvrIndex()
_allUser = g.crossDB.find('crosszb_zb', {'dkey': '2018-44', 'sid': sid}, fields=['_id', 'uid', 'rankprize', 'rank'])
for i in _allUser:
    if i['uid'] in uidList:
        continue
    # 读取奖励
    _prize = g.m.crosszbfun.getCrossZBRankPrizeCon(i['rank'])
    g.m.emailfun.sendEmails([i['uid']], 1,_title,g.C.STR(_content,i['rank']),_prize)

print 'ok...............'