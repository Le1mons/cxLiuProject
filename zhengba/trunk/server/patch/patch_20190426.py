#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g


print 'start'
g.mdb.delete('playattr', {'ctype': 'shizijun_data'}, RELEASE=1)
g.mdb.update('hero', {'star': {'$gte': 9}, 'hid':'22066'},{'$addToSet':{'bd3skill':'2206a324'}}, RELEASE=1)

print 'finfish'