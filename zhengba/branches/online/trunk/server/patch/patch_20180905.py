#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    删除好友印记赠送数据  月卡时间恢复   装备usenum 恢复
'''
print 'equip acction'
_allUser = g.mdb.find('userinfo', {}, fields=['_id', 'uid'])
_allUid = map(lambda x: x['uid'], _allUser)
for i in _allUid:
    all_equip = g.mdb.find('equiplist',{'uid':i})
    for j in all_equip:
        eid = j['eid']
        type = j['type']
        usenum = g.mdb.count('hero',{'weardata.{}'.format(type):eid,'uid':i})
        g.mdb.update('equiplist', {'uid': i,'eid':eid},{'usenum':usenum})

print 'equip ok '
