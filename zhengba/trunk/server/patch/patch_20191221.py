#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g

'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
g.mdb.delete('shops',{'shopid': {'$in': ['10', '11']}},RELEASE=1)

# 更新法师塔数据
_all = g.mdb.find('userinfo', {'lv': {'$gte': 20}})
for i in _all:
    gud = g.getGud(i['uid'])
    # 上传到跨服
    _set = {'mapid': gud['maxmapid'], 'headdata': g.m.userfun.getShowHead(i['uid']), 'zhanli':gud['maxzhanli'],'ttltime':g.C.TTL()}
    g.crossDB.update('tanxian', {'uid': i['uid']}, _set, upsert=True)

print 'end...............'
