#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g

'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
all = g.mdb.find('gamelog', {'type': 'shouchong_recprize', 'data.rectype':'3', 'data.recidx': 0, 'ctime': {'$gte': 1589886000}})

_insert = []
for i in all:
    _emailData = {'title': '至尊首充奖励补发', 'uid': i['uid'], 'content': '', 'prize': [{"a":"item","t":"4023","n":50}]}
    _insert.append(g.m.emailfun.fmtEmail(**_emailData))

if _insert:
    g.mdb.insert('email', _insert)
print 'SUCCESS..............'
