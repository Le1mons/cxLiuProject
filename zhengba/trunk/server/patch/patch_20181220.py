#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.delete('shops', {'shopid':'8'},RELEASE=1)

print 'ok...............'