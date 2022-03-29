#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    神器任务
'''
print 'start..................'
_res = {}
_cz = {}
_all = g.mdb.find('paylist',fields=['_id','uid','money','ctime'])
for i in _all:
    _res[i['uid']] = _res.get(i['uid'], 0) + int(i['money'])
    if i['ctime'] >= 1558627200:
        _cz[i['uid']] = _cz.get(i['uid'], 0) + int(i['money'])

_hd = g.mdb.find1('hdinfo',{'htype': 11}, fields=['_id', 'hdid'])
for uid in _res:
    if _res[uid] > 6:
        a = g.m.huodongfun.getMyHuodongData(uid, _hd['hdid'], keys='_id,val,gotarr')
        g.m.huodongfun.setMyHuodongData(uid, _hd['hdid'], {"$inc": {"val": 1}})
    a = g.m.huodongfun.getMyHuodongData(uid, 1302, keys='_id,val,gotarr')
    g.m.huodongfun.setMyHuodongData(uid, 1302, {"$inc": {"val": _res[uid]}})

print 'ok...............'