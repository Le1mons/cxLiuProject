#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'
# g.mdb.delete('playattr',{'ctype':{'$in': ['libao_week', 'libao_month','vip_alreadypack']}},RELEASE=1)

g.mdb.update('trial',{}, {'receive': []},RELEASE=1)

_nt = g.C.NOW()
_all = g.mdb.find('hdinfo')
_con = g.GC['huodong']
_insert = []
for i in _all:
    if _nt >= i['stime']:
        continue
    g.mdb.delete('hdinfo', {'_id': i['_id']},RELEASE=1)
    for x in _con:
        if x['hdid'] == i['hdid']:
            _tmpData = {}
            _tmpData.update(x)
            _tmpData["stime"] = g.C.ZERO(_tmpData["stime"] * 24 * 3600 + g.getOpenTime())
            _tmpData["etime"] = g.C.ZERO(_tmpData["etime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
            _tmpData["rtime"] = g.C.ZERO(_tmpData["rtime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
            _st = g.C.getDate(_tmpData["stime"], "%m月%d日00:00")
            _et = g.C.getDate(_tmpData["rtime"], "%m月%d日23:59")
            _tmpData["showtime"] = _st + "-" + _et
            _insert.append(_tmpData)

for x in _con:
    if x['hdid'] in (2102, 2103):
        _tmpData = {}
        _tmpData.update(x)
        _tmpData["stime"] = g.C.ZERO(_tmpData["stime"] * 24 * 3600 + g.getOpenTime())
        _tmpData["etime"] = g.C.ZERO(_tmpData["etime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
        _tmpData["rtime"] = g.C.ZERO(_tmpData["rtime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
        _st = g.C.getDate(_tmpData["stime"], "%m月%d日00:00")
        _et = g.C.getDate(_tmpData["rtime"], "%m月%d日23:59")
        _tmpData["showtime"] = _st + "-" + _et
        _insert.append(_tmpData)

if _insert:
    g.mdb.insert('hdinfo', _insert)


print 'OK'


