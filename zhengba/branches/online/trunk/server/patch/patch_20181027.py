#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'

g.mdb.update('itemlist',{'usetype':'5'},{'$inc':{'etime': 24*3600}})

print 'ok...............'