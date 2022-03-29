#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
g.mdb.delete('hddata', {'hdid':1544623028,'gotarr':[]},RELEASE=1)

g.mc.delete('huodong_21')
_con = g.GC['hero']
_idList = ['3109']
all = g.mdb.find('hddata',{'hdid': 1544623028},fields=['_id','uid'])
for i in all:
    _allHero = g.mdb.find('hero', {'uid': i['uid']}, fields=['_id', 'hid', 'star'])
    _res = {}
    for hero in _allHero:
        if _con[hero['hid']]['pinglunid'] not in _idList:
            continue

        if hero['star'] > _res.get(_con[hero['hid']]['pinglunid'], 0):
            _res[_con[hero['hid']]['pinglunid']] = hero['star']

    setData = {"$set": {'val':_res}}

    _r = g.m.huodongfun.setMyHuodongData(i['uid'], 1544623028, setData)


print 'ok...............'