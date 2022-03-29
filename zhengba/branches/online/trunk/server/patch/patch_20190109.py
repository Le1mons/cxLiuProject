#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_w = {'ctype': 'zypkjjc_dayprize'}
_data = g.mdb.find1('gameconfig', _w)
_nt = g.C.NOW()
if not _data and not g.C.chkSameDate(_data['lasttime'], _nt):
    g.m.zypkjjcfun.timer_sendEveryPrize()
    g.mdb.update('gameconfig', _w, {'v': 1, 'lasttime': _nt}, upsert=True)
print 'ok...............'