#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

''' 
    更新装备
'''
print 'start..................'
_all = g.mdb.find('fashita')
_con = g.GC['fashitacom']['passprize']
for i in _all:
    _layer = i['layernum'] // 10 * 10
    _queshi = list(set(range(10, _layer+1, 10)) ^ set(i['prizelist']))
    if not _queshi:
        continue
    print g.mdb.find1('userinfo',{'uid':i['uid']},fields=['_id','name'])['name']
    print i['uid']
    print _queshi

    g.mdb.update('fashita',{'uid':i['uid']},{'$push':{'prizelist':{'$each': _queshi}}},RELEASE=1)
    _prize = []
    for x in _queshi:
        _prize.extend(list(_con[x//10-1][1]))

    _title = '巨龙神殿宝箱奖励'
    _content = '亲爱的玩家你好：\n　　这是您在巨龙神殿未领取的通关宝箱奖励，该问题已修复，给您带来的不便请谅解，感谢您对游戏的支持！'
    g.m.emailfun.sendEmails([i['uid']], 1, _title, _content, _prize)



print 'ok...............'