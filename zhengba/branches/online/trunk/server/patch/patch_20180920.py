#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    开服狂欢计数
'''
print 'start..................'
_all = g.mdb.find('kfkhdata',{'htype':2})
_filter = []
for i in _all:
    uid=i['uid']
    if uid in _filter:
        continue
    _filter.append(uid)
    _allPay = g.m.payfun.getAllPayYuan(uid)
    g.mdb.update('kfkhdata',{'uid':uid, 'htype':2},{'nval':_allPay})
print 'ok...............'