#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('hero',({'weardata.6':{'$exists':1},'baoshilv':{'$exists':0}}),fields=['weardata','uid'])
for i in _all:
    _bsLv = i['weardata']['6'].keys()[0]
    g.mdb.update('hero',{'_id':i['_id']},{'baoshilv':int(_bsLv)},RELEASE=1)
    _addData = []
    _con = g.GC['kaifukuanghuan']['6']
    for hdid, hddata in _con.items():
        if hddata['htype'] == 21:
            _nVal = g.m.kfkhfun.getCondVal(i['uid'], '6', hdid)
            g.mdb.update('kfkhdata', {'uid':i['uid'],'htype':21,'hdid':int(hdid)},{'nval':_nVal})

print 'ok...............'