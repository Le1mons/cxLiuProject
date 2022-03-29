#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('gamelog',{'type':'xuyuanchi_lottery','data.super':0,'data.pool':'common'})
_res={}
for i in _all:
    if len(i['data']['prize']) == 1:
        continue
    _prizr = []
    for j in i['data']['prize']:
        if (j['t']=='jinbi' and j['n']>=1000000) or (j['t']=='useexp' and j['n']>=500000):
            _prizr.append(j)

    if _prizr:
        uid = i['uid']
        _res[uid] = _res.get(uid,[]) + _prizr

for uid in _res:
    _user = g.getGud(uid)
    for x in g.fmtPrizeList(_res[uid][1:]):
        _num = _user[x['t']] - x['n'] if _user[x['t']] - x['n']>0 else 0
        g.mdb.update('userinfo',{'uid':uid},{x['t']: _num},RELEASE=1)



print 'ok...............'