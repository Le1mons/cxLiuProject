#!/usr/bin/env python
#coding:utf-8

import sys
sys.path.append('game')

import g


'''
    冠军试炼
'''
print 'friend treasure  start ...'
g.mdb.update('championtrial',{'jifen':{'$lte': 200}},{'$inc':{'jifen':1000}},RELEASE=1)
print 'OK'
