#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_a = g.mc.get('ghcompeting_5c11d2c177f23b7e282d17cd')
print map(lambda x:x['ghid'], _a)
# g.mc.delete('ghcompeting_5c11d2c177f23b7e282d17cd')
print 'ok...............'