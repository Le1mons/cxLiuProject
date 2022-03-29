#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
# _all = g.mdb.find('userinfo',{'destiny':{'$gte':435000}},fields=['uid'])
# for i in _all:
#     g.setAttr(i['uid'], {'ctype': 'chenghao_list'}, {'$push': {'v': 'tianming1'}})

if 1582992000 <= g.getOpenTime() <= 1583683199:
    hd = [i for i in g.GC['huodong'] if i['hdid'] == 4120][0]
    g.mdb.update('hdinfo', {'hdid':4120}, {'data':hd['data'],'icon':hd['icon']})

print 'SUCCESS..............'
