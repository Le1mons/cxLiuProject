#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'

_all = g.mdb.find('stat',{'ctype':'chongzhi_allpaynum','v':{"$gte":10}},fields=['_id','uid','v'])
_zeroTime = g.C.ZERO(g.C.NOW())
for i in _all:
    if g.mdb.find1('playattr',{'uid':i['uid'],'ctype':'shouchong_data'}):
        continue
    _res = {
        '1': {'show': 1, 'rec': [], 'chkrectime': []},
        '2': {'show': 1, 'rec': [], 'chkrectime': []},
        '3': {'show': 0, 'rec': [], 'chkrectime': []}
    }
    if i['v'] >= 10:
        _res['1']['chkrectime'] = [_zeroTime,_zeroTime+24*3600,_zeroTime+48*3600]
    if i['v'] >= 100:
        _res['2']['chkrectime'] = [_zeroTime,_zeroTime+24*3600,_zeroTime+48*3600]
    g.mdb.insert('playattr',{'uid':i['uid'],'ctime':g.C.NOW(),'lasttime':g.C.NOW(),'ctype':'shouchong_data','v':_res})

print 'OK'
