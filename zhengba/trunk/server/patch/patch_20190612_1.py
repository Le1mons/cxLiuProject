#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g


dkey = g.m.crosswzfun.getDKey()
print 'get dkey: ', dkey
print g.crossDB.update('wzfight', {'dkey': dkey}, {'deep': 0})
print g.crossDB.update('crossconfig', {'k': dkey, 'ctype': 'wangzhestep'}, {'v': 'daluandoujinjiprize'})
g.m.crosswzfun.act_zuanShiGroupFight(0)
