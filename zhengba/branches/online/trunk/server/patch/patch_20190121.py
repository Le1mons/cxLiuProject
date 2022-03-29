#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.update('userinfo',{},{'model':''},RELEASE=1)
print 'ok...............'