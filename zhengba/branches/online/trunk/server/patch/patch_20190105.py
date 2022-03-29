#!/usr/bin/python
# coding:utf-8

'''
战力前n名报名
'''

import sys
sys.path.append("..")
sys.path.append("./game")
import g
import random


def doBaoming():
    _dkey = g.m.crosswzfun.getDKey()
    _nt = g.m.crosswzfun.now()
    _haveNum = g.crossDB.find('wzbaoming', {'dkey': _dkey}, fields=['_id', 'uid'])
    _uidList = [_tmp['uid'] for _tmp in _haveNum]
    _data = g.mdb.find('userinfo', {'uid': {'$nin': _uidList}, 'lv': {'$gte': 75}}, sort=[['maxzhanli', -1]], fields=['_id', 'uid', 'maxzhanli'])
    i = 0
    for _user in _data:
        _bmData = {
            'uid': _user['uid'],
            'dkey': _dkey,
            'ctime': _nt,
            'jifen': 0,
            'fightdata': [],
            'renum': 0,
        }

        heroList = g.mdb.find('hero', {'uid': _user['uid']}, fields={'_id': 1}, sort=[['lv', -1]], limit=18)
        _heroData = [{}, {}, {}]
        for idx, hero in enumerate(heroList):
            gidx = idx % 3
            posIdx = idx // 3
            _heroData[gidx].update({str(posIdx + 1): str(hero['_id'])})
        _myZhanli = 0
        for hidx, hgroup in enumerate(_heroData):
            _chkRes = g.m.fightfun.chkFightData(_user['uid'], hgroup)
            _myZhanli += _chkRes['zhanli']
            _heroData[hidx] = g.m.fightfun.getUserFightData(_user['uid'], _chkRes['herolist'], 0, sqid=None)

        g.m.crosswzfun.uploadUserData(_user['uid'], zldata={'zhanli': _myZhanli, 'maxzhanli': _myZhanli})
        _heroData = [t for t in _heroData if t]
        _bmData['herodata'] = _heroData
        _bmData['zhanli'] = _myZhanli
        _bmData['curzhanli'] = _myZhanli
        g.crossDB.insert('wzbaoming', _bmData)
        i += 1
        percent = 1.0 * i / len(_haveNum) * 100
        sys.stdout.write("\r")
        print str(int(percent)) + '%',
    print i, 'Done!'


if __name__ == '__main__':
    doBaoming()
