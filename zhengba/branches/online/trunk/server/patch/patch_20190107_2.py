#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_all = g.mdb.find('paylist',{'rmbmoney':6480,'proid':'rmbmoney','ctime':{'$gte':1546826400}})
_title = '11星养成礼包道具找回'
_content = '亲爱的玩家，您充值的11星养成礼包除钻石外，其他道具异常未获取。丢失的道具给您找回来啦，祝游戏愉快！'
_prize = [{"a": "attr","t": "jinbi","n": 50000000},{"a": "attr","t": "useexp","n": 40000000},{"a": "item","t": "1009","n": 1}]
for i in _all:
    uid = i['uid']
    g.m.emailfun.sendEmails([uid], 1, _title, _content, prize=_prize)


print 'ok...............'

