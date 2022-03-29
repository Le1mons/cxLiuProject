#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
g.mdb.update('itemlist',{'itemid': {'$in': ['1103','1104']}},{'usetype':'15'},RELEASE=1)

print 'SUCCESS..............'
