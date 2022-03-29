#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
# g.mdb.delete('task',{'type':2})
#
_all = g.mdb.find('task',{'type':1})
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
            _num, _usenum,_id = 0,0,None
            for i in a:
                _id = i['_id']
            g.mdb.delete('task',{'uid':uid,'taskid':eid,'_id':{'$nin': [_id]}})

_all = g.mdb.find('userinfo')
_con = g.GC['pre_task']
for i in _all:
    uid = i['uid']
    for k,v in _con['1'].items():
        if k not in ['112001','113001','114001','115001'] and v['pretask']:
            g.mdb.delete('task',{'uid':uid,'ctime':{'$gt':1543289400}})

print 'ok...............'