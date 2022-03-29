#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.delete('shops',{'shopid':'8'},RELEASE=1)
# g.mdb.update('hddata',{'htype': 170},{'hdid':170},RELEASE=1)
# g.mdb.update('hddata',{'htype': 180},{'hdid':180},RELEASE=1)
# g.mdb.delete('hdinfo',{'htype':170,'hdid':{'$ne':170}},RELEASE=1)
# g.mdb.delete('hdinfo',{'htype':180,'hdid':{'$ne':180}},RELEASE=1)
print 'ok...............'