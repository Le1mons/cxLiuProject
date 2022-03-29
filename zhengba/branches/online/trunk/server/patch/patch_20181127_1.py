#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('userinfo')
_con = g.GC['task']
uid1 = g.buid('lsq555')
for i in _all:
    uid=i['uid']
    if uid == uid1:
        pass
    _tasks = g.mdb.find('task',{'uid':uid,'type':1})
    num = 0
    for x in _tasks:
        _pre = x['taskid']
        if x['isreceive'] == 1:
            num += 1
        while _pre:
            _pre = _con[_pre]['pretask']
            if _pre:
                num += 1
    if num > 0:
        g.mdb.update('userinfo',{'uid':uid},{'success':num*10},RELEASE=1)



print 'ok...............'