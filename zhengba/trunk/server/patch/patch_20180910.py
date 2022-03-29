#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    好友探宝发送奖励
'''
print 'friend treasure  start ...'
_time = g.C.ZERO(g.C.NOW() + 24*60*60)
g.mdb.update('shops',{'shopid':'6'},{'freetime':_time})
print 'OK'
