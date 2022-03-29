#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
_all = g.mdb.find('hero',{'star':13})
_res = {}
for i in _all:
    _res[i['uid']] = _res.get(i['uid'], 0) + 1

for uid,num in _res.items():
    g.setAttr(uid,{'ctype':'hero_starupgrade'}, {'v': {'14':num,'15':num}})

print 'SUCCESS..............'
