#!/usr/bin/python
# coding:utf-8


import sys
sys.path.append('game')
import g

print 'competing_upload start ...'
_data = {'star': 10, 'dengjielv': 10, 'dengjie': 6, 'lv': 255}
_all = g.mdb.find('userinfo',{},fields=['_id','uid'])
for i in _all:
    uid = i['uid']
    for hid in ('11086', '23036', '31096', '43066', '55016', '61026'):
        g.m.herofun.addHero(uid, hid, _data)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid, {'star': 10})
    for i in _heroData:
        _heroData[i].update(_data)
    g.sendUidChangeInfo(uid, {'hero': _heroData})
print 'competing_upload end ...'