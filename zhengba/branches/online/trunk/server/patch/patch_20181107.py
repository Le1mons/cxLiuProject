#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_allUser = g.mdb.find('userinfo',fields=['_id','uid'])
_9 = '102901'
_10 = '102a01'
_con = g.GC['task']
_black = g.GC['tongyu']['base']['herozu']
_heroCon = g.GC['hero']
for user in _allUser:
    _tasks = g.mdb.find1('task', {'type': 1, 'taskid': _10,'uid':user['uid']}, fields=['_id', 'taskid'])
    if not _tasks:
        _nval = g.mdb.count('hero',{'uid':user['uid'],'star':{'$gte':10}})
        _setData = {'uid':user['uid'],'ctime':g.C.NOW(),'stype':102,'pval':1,'nval':_nval,'prize':_con[_10],'isreceive':0,'taskid':_10,'type':1}
        g.mdb.insert('task',_setData)

    _tasks = g.mdb.find1('task', {'type': 1, 'taskid': _9,'uid':user['uid']}, fields=['_id', 'taskid'])
    if not _tasks:
        _nval = g.mdb.count('hero',{'uid':user['uid'],'star':{'$gte':9}})
        _setData = {'uid':user['uid'],'ctime':g.C.NOW(),'stype':102,'pval':1,'nval':_nval,'prize':_con[_9],'isreceive':0,'taskid':_9,'type':1}
        g.mdb.insert('task',_setData)

    _heros = g.mdb.find('hero',{'star':{'$gt':4},'uid':user['uid']},fields=['_id','hid','star'])
    _res = {}
    for hero in _heros:
        _plId = _heroCon[hero['hid']]['pinglunid']
        if _plId not in _black:
            continue
        if _plId in _res and _res[_plId]['maxlv'] < hero['star'] - 4:
            _res[_plId]['maxlv'] = hero['star'] - 4
        elif _plId not in _res:
            _res[_plId] = {'maxlv':hero['star'] - 4, 'mylv':0}

    _set = [{'tyid':i,'uid':user['uid'],'maxlv':_res[i]['maxlv'],'mylv':0,'ctime':g.C.NOW(),'lasttime':g.C.NOW()} for i in _res]
    if _set:
        g.mdb.insert('tongyu', _set)



print 'ok...............'