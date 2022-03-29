#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('playattr',{'ctype':'yueka_da','v.isjh':0})
for i in _all:
    _pay = g.m.payfun.getAllPayYuan(i['uid'])
    if _pay < 98:
        g.setAttr(i['uid'], {'ctype':'yueka_da'},{'v.rmbmoney': _pay*100})
    else:
        _w = {'uid':i['uid'],'type':'pay','data.diffattr':{'$exists':1}}
        # _temp = g.mdb.find1('gamelog',{'uid':i['uid'],'type':'EMAIL','$and':[{'data.prize.t':'2007'},{'data.prize.t':'rmbmoney'}]},sort=[['ctime',-1]])
        # if not _temp:
        _temp = g.mdb.find1('gamelog',{'uid':i['uid'],'type':'da'},sort=[['ctime',-1]])
        if _temp:
            _w['ctime'] = {'$gte': g.C.ZERO(_temp['ctime']) + 24 * 3600}
        _allPay = g.mdb.find('gamelog',_w)
        _money = sum(map(lambda x:x['data']['diffattr']['payexp'] / 10, _allPay))
        g.setAttr(i['uid'], {'ctype': 'yueka_da'}, {'v.rmbmoney': _money * 100})

print 'ok...............'