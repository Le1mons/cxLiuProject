#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
g.mdb.delete('shops',{'shopid': {'$in': ['7','10','11']}},RELEASE=1)

print 'SUCCESS..............'
