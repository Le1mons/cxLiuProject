#!/usr/bin/env python
#coding:utf-8

import sys,os
sys.path.append('game')

import g


'''
    更改玩家跨服战斗数据
'''
print 'activation  start ...'
sid = g.getSvrIndex()
_allUser = g.crossDB.find('jjcdefhero', {'sid': sid})
for i in _allUser:
    uid = i['uid']
    fightdata = i['fightdata']
    _chkFightData = g.m.fightfun.chkFightData(uid, fightdata)
    if _chkFightData['chkres'] < 1:
        g.crossDB.delete('jjcdefhero', {'uid': uid})
    else:
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1)
        g.crossDB.update('jjcdefhero', {'uid': uid}, {'fightdata': _userFightData})


print 'OK'
