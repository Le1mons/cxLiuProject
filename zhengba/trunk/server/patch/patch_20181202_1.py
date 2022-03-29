#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.delete('playattr', {'ctype': {'$regex':'xuyuanchi_super'}},RELEASE=1)

print 'ok...............'