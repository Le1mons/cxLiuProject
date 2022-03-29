#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'
g.mdb.delete('shops',{'shopid': {'$in': ['10']}})

print 'OK'


