#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    冠军试炼
'''
_con = g.GC['task']
print 'friend treasure  start ...'
_all = g.mdb.find('gonghuiuser', {}, fields=['_id', 'uid'])

print '删除成就任务'
g.mdb.delete('task', {'type': 1}, RELEASE=1)
for i in _all:
    _nt = g.C.NOW()
    uid = i['uid']
    gud = g.getGud(uid)
    g.mdb.update('stat', {'ctype': 'gonghui', 'uid': uid}, {'v': 1, 'lasttime': _nt}, upsert=True)

_userList = g.mdb.find('userinfo', {}, fields=['_id', 'uid'])
for i in _userList:
    _nt = g.C.NOW()
    uid = i['uid']
    gud = g.getGud(uid)
    # 地图任务统计
    g.mdb.update('stat', {'ctype': 'maxmap', 'uid': uid}, {'v': gud.get('maxmapid', 0), 'lasttime': _nt}, upsert=True)
    # 玩家等级统计
    g.mdb.update('stat', {'ctype': 'wanjialv', 'uid': uid}, {'v': gud.get('lv', 1), 'lasttime': _nt}, upsert=True)
    # 最大英雄等级
    _hero = g.mdb.find1('hero', {'uid': uid}, sort=[['lv', -1]])
    if _hero:
        _lv = _hero['lv']
        g.mdb.update('stat', {'ctype': 'yingxionglv', 'uid': uid}, {'v': _lv, 'lasttime': _nt}, upsert=True)

    # 法师塔最高层数
    _info = g.m.fashitafun.getFashitaInfo(uid)
    if _info:
        _fstNum = _info.get('layernum', 0) if _info else 0
        g.mdb.update('stat', {'ctype': 'fashita', 'uid': uid}, {'v': _fstNum, 'lasttime': _nt}, upsert=True)

    # 新的成就任务统计
    _nt = g.C.NOW()
    _ele = {'isreceive': 0, 'uid': uid, 'lasttime': _nt, 'ctime': _nt}
    _taskList = []
    for i, j in _con.items():
        if j['type'] == 1 and not j['pretask']:
            _nval = 0
            # if i == '109001':
            #     _nval = _szjNum
            if i == '106001':
                _nval = g.m.zypkjjcfun.getZypkjjcJifen(uid)
            elif i == '102601':
                _nval = g.mdb.count('hero', {'uid': uid, 'star': 6})
            elif i == '101001':
                _nval = gud.get('lv', 1)
            elif i == '102501':
                _nval = g.mdb.count('hero', {'uid': uid, 'star': 5})
            elif i == '102a01':
                _nval = g.mdb.count('hero', {'uid': uid, 'star': 10})
            elif i == '104301':
                _nval = g.mdb.count('equiplist', {'uid': uid, 'color': 3})
            elif i == '102401':
                _nval = g.mdb.count('hero', {'uid': uid, 'star': 4})
            elif i == '102901':
                _nval = g.mdb.count('hero', {'uid': uid, 'star': 9})
            elif i == '104401':
                _nval = g.mdb.count('equiplist', {'uid': uid, 'color': 4})
            elif i == '104501':
                _nval = g.mdb.count('equiplist', {'uid': uid, 'color': 5})
            _temp = _ele.copy()
            _temp.update({'taskid': j['id'], 'prize': j['prize'], 'pval': j['pval'],
                          'type': j['type'], 'stype': j['stype'], 'nval': _nval})
            _taskList.append(_temp)
    g.mdb.insert('task', _taskList)

g.mdb.update('task', {'type': 2, 'taskid': '4'}, {'pval': 3}, RELEASE=1)
# 删除远征商店
g.mdb.delete('shops', {'shopid': '3'}, RELEASE=1)
# 删除礼包
_all = g.mdb.find('playattr', {"ctype": {'$in': ['libao_week', 'libao_month']}})
g.mdb.delete('playattr', {"ctype": {'$in': ['libao_week', 'libao_month']}}, RELEASE=1)
for i in _all:
    uid = i['uid']
    _ctype = i['ctype']
    if _ctype.endswith('week'):
        _ctype = 'week'
    else:
        _ctype = 'month'
    g.m.weekmonthlibaofun.initData(uid, _ctype)