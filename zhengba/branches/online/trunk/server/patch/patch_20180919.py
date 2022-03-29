#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    神器任务
'''
print 'start..................'
g.mdb.update('stat',{'ctype':'ronghe'},{'k': 5},RELEASE=1)
_all = g.mdb.find('paylist',{'proid':"djjj128"},fields=['_id','uid'])
for i in _all:
    uid = i['uid']
    hdid = 400
    _info = g.mdb.find1('hddata',{'hdid':400,'uid':uid})
    if _info:
        if -1 not in _info.get('gotarr',[]):
            g.mdb.update('hddata', {'hdid': 400, 'uid': uid},{'$push':{'gotarr': -1}})
    else:
        lv = g.getGud(uid)['lv']
        g.mdb.insert('hddata', {'hdid': 400, 'uid': uid,'gotarr': [-1],'val':lv})

print 'ok...............'