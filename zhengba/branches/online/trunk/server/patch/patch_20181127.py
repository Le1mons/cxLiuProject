#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'

_hdCd = g.m.huodongfun.chkZCHDopen('dianjin')
num = 5 if _hdCd else 1
g.mdb.update('playattr',{'ctype':'dianjin_cd'},{'v.act.{}'.format(4):num},RELEASE=1)

_all = g.mdb.find('task',{})
_res = {}
for i in _all:
    if i['uid'] in _res:
        _res[i['uid']][i['taskid']] = _res[i['uid']].get(i['taskid'],0) + 1
    else:
        _res[i['uid']] = {i['taskid']: 1}
for uid in _res:
    for eid,num in _res[uid].items():
        if num > 1:
            a = g.mdb.find('task',{'uid':uid,'taskid':eid})
            _id = None
            for i in a:
                _id = i['_id']
            g.mdb.delete('task',{'uid':uid,'taskid':eid,'_id':{'$nin': [_id]}})
print 'ok...............'