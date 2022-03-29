#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
_con = g.GC['kaifukuanghuan']
_res = {}
for day,ele in _con.items():
    for hdid, item in ele.items():
        item['day'] = int(day)
        _res[hdid] = item

uids = set()
_all = g.mdb.find('kfkhdata',{"hdid":{'$lt':1000}})
for i in _all:
    _hdid = i['hdid']+i['day']*1000
    g.mdb.update('kfkhdata', {'_id':i['_id']}, {'hdid': _hdid},RELEASE=1)

a = []
_all = g.mdb.find('kfkhdata')
for i in _all:
    _hdid = i['hdid']
    if i['finish'] == 0:
        if _hdid in (5008,5009,5010,5011,5012):
            _nval = g.mdb.count('hero', {'uid':i['uid'], 'star':{'$gte':_res[str(_hdid)]['cond'][0]}})
            g.mdb.update('kfkhdata', {'_id': i['_id']}, {'nval': _nval}, RELEASE=1)

        elif _hdid in (7003,7004,7005,7006,7007):
            _nval = g.mdb.find1('kfkhdata', {'uid': i['uid'], 'hdid':7004})['nval']
            g.mdb.update('kfkhdata', {'_id': i['_id']}, {'nval': _nval}, RELEASE=1)
    uids.add(i['uid'])

    if int(_hdid) == 2012 and i['uid'] not in uids:
        uid = i['uid']
        uids.add(i['uid'])
        nval = i['nval']
        a.append(g.m.kfkhfun.fmtData(uid,2,2015,nval=nval))

if a:
    g.mdb.insert('kfkhdata', a)

for hdid,ele in _res.items():
    g.mdb.update('kfkhdata', {'hdid': int(hdid)}, {'tab': ele['tab'],'pval':ele['pval'],'day':ele['day']}, RELEASE=1)


g.mdb.delete('shops',{'shopid': {'$in': ['11']}},RELEASE=1)
print 'SUCCESS..............'
