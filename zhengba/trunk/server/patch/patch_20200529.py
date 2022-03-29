#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
if g.getOpenTime() >= 1589904000:
    all = g.mdb.find('hdinfo', {'hdid': {'$in': [4400,4401,4402,4403,4404,4405]}})
    for i in all:
        for x in i['data']['duihuan']:
            if x['prize'][0]['t'] == '1003' and x['prize'][0]['n'] == 50:
                x['prize'][0]['n'] = 1
        g.mdb.update('hdinfo', {'_id': i['_id']}, {'data': i['data']})


print 'SUCCESS..............'
