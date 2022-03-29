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


def creatPlayer(data, **args):
    '''
    创建一个玩家
    '''
    _nt = g.m.crosswzfun.now()
    #默认属性配置
    _userInfoTable = g.GC["table"]["userinfo"]
    userTableData = {
        'ctime': _nt,
        'lasttime': _nt,
        'mapid':1,
        'maxmapid':1,
        'lv': 1,
        'exp':0,
        'sid': 0,
        'uid':g.C.getUniqCode(),
        'lastpassmaptime':_nt,
        'maxzhanli':0,
        'jifen': 3000
    }
    #初始化buff
    userTableData.update(data)
    _nData = {}
    _nData.update(userTableData)
    userTableData.update(args)
    _oid = g.mdb.insert('userinfo', userTableData)
    _sidx = '0'
    uid = _sidx + '_' + str(_oid)
    uuid = _sidx + g.C.getUUIDByDBID(str(_oid))
    _uinfo = {
        'uid': uid,
        'uuid':uuid
    }
    _res = g.mdb.update('userinfo', {'_id': _oid}, _uinfo)
    # 随机发送12个hero
    hCon = g.GC['hero']
    hidList = [t for t in hCon]
    randHid = random.sample(hidList, 12)
    for hid in randHid:
        _newHero = g.m.herofun.addHero(uid, hid)
        _heroData = g.m.herofun.reSetHeroBuff(uid, _newHero['tid'])
    return uid


def doBaoming(num):
    _dkey = g.m.crosswzfun.getDKey()
    _haveNum = g.crossDB.find('wzbaoming', {'dkey': _dkey}, fields=['_id', 'uid'])
    _uidList = [_tmp['uid'] for _tmp in _haveNum]
    _data = g.mdb.find('userinfo', {'uid': {'$nin': _uidList}}, sort=[['maxzhanli', -1]], fields=['_id', 'uid', 'maxzhanli'], limit=num)
    if len(_data) <= num:
        print 'no enough data, start creat random data'
        maxzhanli = 1881752069
        minzhanli = 1065
        for i in xrange(num - len(_data)):
            sampleData = {}
            _unid = g.C.getUniqCode()
            zhanlival = random.randint(minzhanli, maxzhanli)
            sampleData['zhanli'] = zhanlival
            sampleData['maxzhanli'] = zhanlival
            uniqcode = g.C.getUniqCode()
            sampleData['binduid'] = 'robot' + str(_unid)
            sampleData['sex'] = random.randint(0,1)
            sampleData['name'] = '机器人' + str(_unid)
            sampleData['lv'] = random.randint(75,90)
            sampleuid = creatPlayer(sampleData)
            sampleData['uid'] = sampleuid
            _data.append(sampleData)

    _nt = g.m.crosswzfun.now()
    i = 0
    hCon = g.GC['hero']
    hidList = [t for t in hCon]
    for _user in _data:
        _bmData = {
            'uid': _user['uid'],
            'dkey': _dkey,
            'ctime': _nt,
            'jifen': 0,
            'fightdata': [],
            'renum': 0,
        }

        heroNum = g.mdb.count('hero', {'uid': _user['uid']})
        if heroNum < 18:
            # 随机发送12个hero
            randHid = random.sample(hidList, 18 - heroNum)
            for hid in randHid:
                _newHero = g.m.herofun.addHero(_user['uid'], hid)
                _heroData = g.m.herofun.reSetHeroBuff(_user['uid'], _newHero['tid'])

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
        percent = 1.0 * i / num * 100
        sys.stdout.write("\r")
        print str(int(percent)) + '%',
    print i, 'Done!'


if __name__ == '__main__':
    _num = raw_input('input:')
    doBaoming(int(_num))
