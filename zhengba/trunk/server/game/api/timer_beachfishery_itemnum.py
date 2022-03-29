#!/usr/bin/env python
#coding:utf-8

'''
海滩渔场
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

def proc(arg, kwarg):
    print 'beachfishery_itemnum open......'
    _hdinfo = g.m.huodongfun.getHDinfoByHtype(45)
    if not _hdinfo:
        return
    _itemid = _hdinfo['data']['init']['itemid']
    g.mdb.update('itemlist',{'num': {'$lt':_hdinfo['data']['init']['num']},'itemid':_itemid},{'num':_hdinfo['data']['init']['num']})

    print 'beachfishery_itemnum end......'



if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
