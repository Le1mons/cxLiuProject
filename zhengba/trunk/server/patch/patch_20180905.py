#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    删除好友印记赠送数据  月卡时间恢复   装备usenum 恢复
'''
print 'equip acction'
# _allUser = g.mdb.find('userinfo', {}, fields=['_id', 'uid'])
# _allUid = map(lambda x: x['uid'], _allUser)
# for i in _allUid:
all_equip = g.mdb.find('equiplist',{'uid':'9780_5c8d5077ea713079de85ac2b'})
for j in all_equip:
    eid = j['eid']
    type = j['type']
    usenum = g.mdb.count('hero',{'weardata.{}'.format(type):eid,'uid':i})
    g.mdb.update('equiplist', {'uid': '9780_5c8d5077ea713079de85ac2b','eid':eid},{'usenum':usenum})

print 'equip ok '
