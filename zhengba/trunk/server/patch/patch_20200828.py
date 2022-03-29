#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
_all = g.mdb.find('hdinfo',{'htype':63})
for i in _all:
    res = []
    for x in i['data']['openinfo']['zhaomu']['showhid']:
        if len(x) == 4:
            res.append(x + '5')
    if res:
        g.mdb.update('hdinfo', {'_id': i['_id']}, {'data.openinfo.zhaomu.showhid': res})

g.mdb.update('hdinfo', {'htype':63}, {'data.openinfo.zhaomu.jifenprize': []})
g.mdb.delete('shops',{'shopid': {'$in': ['11','10','13']}},RELEASE=1)
print 'SUCCESS..............'
