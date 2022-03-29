#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g

'''
    删除好友印记赠送数据  月卡时间恢复   装备usenum 恢复
'''
_all = g.mdb.find('paylist',{'ctime':156419700})
_hd = g.mdb.find1('hdinfo',{'htype':13})
_hdid = _hd['hdid']
_res = {}
for i in _all:
    _res[i['uid']] = _res.get(i['uid'],0) + int(i['money'])


for uid,num in _res.items():
    if g.mdb.find1('hddata',{'uid': uid,'hdid':_hdid}):
        g.mdb.update('hddata',{'uid':uid,'hdid':_hdid},{'$inc':{'val': num}})
    else:
        g.mdb.upsert('hddata', {'uid': uid, 'hdid': _hdid}, {'val': num,'gotarr':[]})

print 'equip ok '
