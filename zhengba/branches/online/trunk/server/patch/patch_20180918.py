#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    日常任务
'''
print 'start..................'
# g.mdb.delete('task',{'type':2},RELEASE=1)
g.mdb.update('stat',{'ctype':'ronghe'},{'k': 5},RELEASE=1)
print 'ok...............'