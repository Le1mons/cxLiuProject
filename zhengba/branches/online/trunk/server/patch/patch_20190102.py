#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_num = g.crossDB.count('competing_signup',{})
if _num > 1:
    g.crossDB.insert('crossconfig', {'k': _num - 1, 'ctype': 'competing_season', 'v': 1, 'ctime': g.C.NOW()})

print 'ok...............'