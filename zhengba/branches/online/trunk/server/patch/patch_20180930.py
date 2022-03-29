#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('friend',{})
for i in _all:
    if 'friend' in i:
        uid = i['uid']
        _friend = i['friend']
        _list = []
        a = False
        for x in _friend:
            if isinstance(x,dict) and 'each' in x:
                _list.extend(x['each'])
                a = True
        if a:
            g.mdb.update('friend',{'uid':uid},{'friend':_list},RELEASE=1)
print 'ok...............'