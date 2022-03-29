#!/usr/bin/python
# coding:utf-8
import sys
sys.path.append('game')
import g
_all = g.mdb.find('task')
_res = {}
_delete = []
for i in _all:
    if i['uid'] not in _res:
        _res[i['uid']] = [i['taskid']]
    else:
        if i['taskid'] in _res[i['uid']]:
            _delete.append(i['_id'])
        else:
            _res[i['uid']].append(i['taskid'])
g.mdb.delete('task',{'_id':{'$in': _delete}},RELEASE=1)

g.mdb.update('hero',{'hid':'13406','star': {'$gte': 10}}, {'$addToSet': {'bd2skill': '1304a231'}},RELEASE=1)
g.mdb.update('hero',{'hid':'25066','star': {'$gte': 10}}, {'$addToSet': {'bd1skill': '2506a131'}},RELEASE=1)
# _all = g.mdb.find('userinfo',fields=['_id', 'uid'])
# for i in _all:
#     uid = i['uid']
#     g.m.herofun.reSetAllHeroBuff(uid,{'hid': {'$in': [
#         '22065', '22066',
#         '61025', '61026',
#         '11086', '11085',
#         '13045', '13046',
#         '25066', '25065',
#         '31076', '31075'
#     ]}})

print 'finfish'