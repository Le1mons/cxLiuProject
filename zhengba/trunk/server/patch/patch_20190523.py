#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    更改玩家跨服战斗数据
'''
print 'activation  start ...'
# g.mdb.update('hero',{'hid':'51016','star':{'$gt':6}},{'$addToSet':{'bd3skill':'5101a311'}},RELEASE=1)
_all = g.crossDB.find('crosszb_zb')
_res = {}
_del = []
for i in _all:
    if i['dkey'] in _res:
        if i['step'] in _res[i['dkey']]:
            _rank = i['rank']
            if i['rank'] in _res[i['dkey']][i['step']]:
                _rank = sorted(list(set(range(1,len(_res[i['dkey']][i['step']])+2))-set(_res[i['dkey']][i['step']])))[0]
                g.crossDB.update('crosszb_zb', {'_id': i['_id']},{'rank':_rank})
            _res[i['dkey']][i['step']].append(_rank)
        else:
            _res[i['dkey']][i['step']] = [i['rank']]
    else:
        _res[i['dkey']] = {i['step']: [i['rank']]}

print 'OK'
