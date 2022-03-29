#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g


print 'start'
_all = g.mdb.find('userinfo', {'payexp':{'$exists': 0},'lv':{'$gte':30}})
for i in _all:
    _data = g.mdb.find('gamelog', {'uid':i['uid'],'data.prize':{'$exists':1},'type':'pay'})
    _prize = []
    for data in _data:
        for j in data['data']['prize']:
            if j['t'] in ('payexp', 'vip'):
                _prize.append(j)
    if _prize:
        g.getPrizeRes(i['uid'], _prize, {'act': 'patch'})

print 'finfish'