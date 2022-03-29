#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    更改玩家跨服战斗数据
'''
print 'activation  start ...'
g.mdb.update('task',{'type':2,'taskid':'13'},{'taskid':'11','prize':[{"a" : "attr","t" : "rmbmoney","n" : 30}],'stype':11},RELEASE=1)
g.mdb.update('hero',{'hid':'24036','star':{'$gte':8}},{'$addToSet':{'bd2skill':'2403a231'}},RELEASE=1)
print 'OK'
