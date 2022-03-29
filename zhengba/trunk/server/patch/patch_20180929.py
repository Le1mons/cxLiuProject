#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新竞技场字段
'''
print 'start..................'
# sid = g.getSvrIndex()
# _all = g.crossDB.find('jjcdefhero',{'sid':sid})
# for i in _all:
#     uid = i['uid']
#     a = g.m.userfun.getShowHead(uid)
#     g.crossDB.update('jjcdefhero',{'uid':uid},{'headdata':a})
g.mdb.update('playattr',{'ctype':'onlineprize_cd','v':{'$gt':1200}},{'v': 0},RELEASE=1)
print 'ok...............'