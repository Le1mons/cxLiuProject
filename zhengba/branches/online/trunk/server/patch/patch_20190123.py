#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_hd = g.mdb.find('hdinfo', {'htype': 31})
if len(_hd) == 2:
    _res = {}
    _hddata = g.mdb.find('hddata',{'hdid':{'$in': map(lambda x:x['hdid'], _hd)}})
    for i in _hddata:
        if i['uid'] in _res:
            _res[i['uid']]['val'] += i['val']
            _res[i['uid']]['gotarr'] += i['gotarr']
            _res[i['uid']]['idx'] = max([i['idx'], _res[i['uid']]['idx']])
        else:
            _res[i['uid']] = {'idx': i.get('idx',0), 'val':i['val'], 'gotarr':i['gotarr']}
    _set = [{'uid':i,'val':_res[i]['val'],'gotarr':_res[i]['gotarr'],'idx':_res[i]['idx'],'hdid':3100} for i in _res]
    g.mdb.delete('hddata',{'hdid':{'$in': map(lambda x:x['hdid'], _hd)}},RELEASE=1)
    g.mdb.delete('hdinfo',{'hdid':{'$ne': 3100},'htype':31},RELEASE=1)
    g.mdb.insert('hddata', _set)


print 'ok...............'