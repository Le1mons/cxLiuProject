#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    更改玩家跨服战斗数据
'''
print 'activation  start ...'
_all = g.mdb.find('gamelog',{'ctime':{"$gte":1549900800},'data.diffattr.rmbmoney':{'$lt':0}})
_res = {}
for i in _all:
    _res[i['uid']] = _res.get(i['uid'], 0) + abs(i['data']['diffattr']['rmbmoney'])
hdinfo = g.mdb.find1('hdinfo',{'stime':{"$gte":1549900800},'htype':16})
if hdinfo:
    hdid = hdinfo['hdid']
    for uid in _res:
        temp = g.mdb.find1('hddata',{'uid':uid,'hdid':hdid})
        if temp:
            g.mdb.update('hddata',{'uid':uid,'hdid':hdid},{'val':_res[uid]})
        else:
            g.mdb.update('hddata',{'uid':uid,'hdid':hdid},{'val':_res[uid],'gotarr':[]},upsert=True)
print 'OK'
