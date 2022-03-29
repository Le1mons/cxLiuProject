#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('userinfo',{},fields=['_id','uid'])
for x in _all:
    _idList = []
    _task = g.mdb.find('task', {'uid':x['uid'],'type':1},sort=[['taskid',1]])
    for i in xrange(len(_task) - 1):
        if _task[i]['taskid'][:4] == _task[i+1]['taskid'][:4]:
            _minTask = min([_task[i],_task[i+1]],key=lambda x:(int(x['taskid']),x['isreceive']))
            _idList.append(_minTask['_id'])
    if _idList:
        g.mdb.delete('task',{'uid':x['uid'],'type':1,'_id':{'$in':_idList}})


print 'ok...............'