#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
# a = [100,200,300,400,500,600,700,800,900,1000,1650,1800,1950,2100,2250,2400,2550,2700,2850,3000,4200,4400,4600,4800,5000,5200,5400,5600,5800,9000,7750,8000,8250,8500,8750,9000,9250,9500,9750,10000,12300,12600,12900,13200,13500,13800,14100,14400,14700,15000]
# _all = g.mdb.find('gonghui',fields=['exp'])
# _con = g.GC['gonghui']['base']['lv2conf']
# for i in _all:
#     for idx,exp in enumerate(a):
#         if i['exp'] < exp:
#             _maxExp = _con[str(idx + 1)]['exp']
#             _serExp = int(i['exp']/float(a[idx])*_maxExp)
#             g.mdb.update('gonghui',{'_id':i['_id']},{'exp':_serExp,'lv':idx},RELEASE=1)
#             break
#
# _all = g.mdb.find('playattr',{'ctype':'user_headlist'})
# for i in _all:
#     num = len(i['v'])
#     g.setAttr(i['uid'],{'ctype':'user_headlist'},{'num':num})
# g.mdb.update('hero',{},{'$unset':{'extbuff':1,'meltsoul':1}},RELEASE=1)
# g.mdb.delete('itemlist',{'itemid':{'$in':['2021','2022']}},RELEASE=1)
# g.mdb.delete('playattr',{'ctype':'meltsoul_cost'},RELEASE=1)
# g.mdb.delete('shops',{'shopid':'4'},RELEASE=1)
# _all = g.mdb.find('hdinfo',{'htype':11,'etime':{'$gt':g.C.NOW()}})
# _all.sort(key=lambda x:x['stime'])
# tidList = map(lambda x:x['_id'], _all[1:])
# if tidList:
#     g.mdb.delete('hdinfo', {'_id': {'$in':tidList}},RELEASE=1)
g.mdb.delete('hdinfo',{'htype':11,'showtime':'10月27日00:00-11月10日23:59'},RELEASE=1)

print 'ok...............'