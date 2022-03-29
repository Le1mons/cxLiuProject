#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('itemlist')
_res = {}
for i in _all:
    if i['uid'] in _res:
        _res[i['uid']][i['itemid']] = _res[i['uid']].get(i['itemid'],0) + 1
    else:
        _res[i['uid']] = {i['itemid']: 1}
for uid in _res:
    for eid,num in _res[uid].items():
        if num > 1:
            a = g.mdb.find('itemlist',{'uid':uid,'itemid':eid})
            _num, _usenum,_id = 0,0,None
            for i in a:
                _num = i['num']
                _id = i['_id']
            g.mdb.delete('itemlist',{'uid':uid,'itemid':eid,'_id':{'$nin': [_id]}})

print 'ok...............'

