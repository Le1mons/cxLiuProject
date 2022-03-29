#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g
_all = g.mdb.find('task',{'type': 2,'uid':'0_5bc01c47c0911a2c50550e5d'})
_res = {}
_delete = []
for i in _all:
    if i['uid'] not in _res:
        _res[i['uid']] = [i['taskid']]
    else:
        if i['taskid'] in _res[i['uid']]:
            _delete.append(i['_id'])
        else:
            _res[i['uid']].append(i['taskid'])
g.mdb.delete('task',{'type':2,'_id':{'$in': _delete}},RELEASE=1)

print 'finfish'