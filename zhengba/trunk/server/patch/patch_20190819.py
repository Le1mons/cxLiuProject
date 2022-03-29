#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    好友
'''

print 'activation shouchong start ...'
g.mdb.update('watcher',{'toplayer':{'$gt':800}},{'toplayer':801},RELEASE=1)
print 'OK'
