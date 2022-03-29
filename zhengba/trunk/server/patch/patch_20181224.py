#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.update('itemlist', {'usetype':'5','etime':{"$exists":0}},{'etime':g.C.NOW() + 10*24*3600},RELEASE=1)

print 'ok...............'