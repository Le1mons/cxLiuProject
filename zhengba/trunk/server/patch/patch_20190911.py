#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'
# g.mdb.update('hero',{'hid':'11096','star':{'$lte':7,'$gte':1}},{'bd2skill':['11096201','11096211','11096204']},RELEASE=1)
# g.mdb.update('hero',{'hid':'52056','star':{'$lte':7,'$gte':1}},{'bd2skill':['52056204']},RELEASE=1)
# g.mdb.update('hero',{'hid':'52055'},{'$addToSet':{'bd3skill':'52055314'}},RELEASE=1)
# g.mdb.update('hero',{'hid':'52056','star':{'$lte':8,'$gte':1}},{'$addToSet':{'bd3skill':'52056314'}},RELEASE=1)
# g.mdb.update('hero',{'hid':'52056','star':{'$lte':13,'$gte':9}},{'$addToSet':{'bd3skill':'5205a314'}},RELEASE=1)
# g.mdb.update('hero',{'hid':'21055'},{'$addToSet':{'bd3skill':'21055334'}},RELEASE=1)
# g.mdb.update('hero',{'hid':'21056','star':{'$lte':8,'$gte':1}},{'$addToSet':{'bd3skill':'21056334'}},RELEASE=1)
# g.mdb.update('hero',{'hid':'21056','star':{'$lte':13,'$gte':9}},{'$addToSet':{'bd3skill':'2105a334'}},RELEASE=1)

import config
conf = config.CONFIG
_ver = conf['VER']
# 如果事跨服
if _ver == 'cross':
    # _all = g.crossDB.find('wzquarterwinner')
    # for i in _all:
    #     if not isinstance(i['ranklist'], dict):
    #         continue
    #     _res = {}
    #     if '1' in i['ranklist']:
    #         _res['1'] = i['ranklist']['1']
    #     if '2' in i['ranklist']:
    #         _res['2'] = i['ranklist']['2']
    #     if '3' in i['ranklist']:
    #         _res['5'] = i['ranklist']['3']
    #     if '4' in i['ranklist']:
    #         _res['3'] = i['ranklist']['4']
    #     if '5' in i['ranklist']:
    #         _res['4'] = i['ranklist']['5']
    #     g.crossDB.update('wzquarterwinner',{'_id':i['_id']},{'ranklist':_res})
    g.crossMC.delete('ISWANGZHEOPEN_2019-36')


# 检查现在玩家是否有满足神器共鸣的条件
# data = g.mdb.find("artifact")
# for d in data:
#     uid = d["uid"]
#     g.m.artifactfun.chkResonance(uid, d)

print 'OK'



