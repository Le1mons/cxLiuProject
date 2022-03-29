#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('playattr',{'ctype':{'$in':['libao_week','libao_month']}},fields=['_id'])
_con = g.GC['weekmonthlibao']
for i in _all:
    for x in i['v']['itemdict']:
        if i['ctype'].endswith('week'):
            num = _con['week']['itemdict'][x]['bymaxnum']
        else:
            num = _con['month']['itemdict'][x]['bymaxnum']
        i['v']['itemdict'][x]['num'] = num
    g.mdb.update('playattr',{'uid':i['uid'],'ctype':i['ctype']},i)

print 'ok...............'