#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g


allusr = g.mdb.find('userinfo', {'lv': {'$gte': 75}}, fields=['_id', 'uid'])
uidList = [t['uid'] for t in allusr]
_dkey = g.m.crosswzfun.getDKey()
_openDay = g.m.crosswzfun.getDOpenDay()
if uidList:
    print g.crossDB.update('wzbaoming', {'uid': {'$in': uidList}, 'dkey': _dkey}, {'openday': _openDay})
print 'finfish'
