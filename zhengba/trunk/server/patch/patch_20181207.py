#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
# 头像框
g.mdb.update('userinfo',{},{'headborder':"1",'chatborder':'1'},RELEASE=1)
g.mc.flush_all()
for i in ('zypkjjclog' , 'xyclog','ctlog'):
    g.mdb.update(i,{},{'ttltime':g.C.TTL()},RELEASE=1)

for i in xrange(1, 301):
    _list = g.mdb.find('fashitalog',{'layernum':i},sort=[['zhanli',1]],limit=3,fields={'_id':1})
    if not _list:
        continue
    _ids = map(lambda x:x['_id'], _list)
    g.mdb.delete('fashitalog', {'_id': {'$nin': _ids}, 'layernum': i},RELEASE=1)

print 'ok...............'