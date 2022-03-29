#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
_hd = g.mdb.find1('hdinfo',{'htype': 14, 'rtime': {'$gte': g.C.NOW()},'stime': {'$lte': g.C.NOW()}})
hdid = _hd['hdid'] if _hd else None
# 删除日常任务
_delList = ['2', '11', '3', '7']
g.mdb.delete('task', {'taskid': {'$in': _delList}})

_dailyTaskList = ['12', '13', '14', '15', '17', '16','18','19','20','21','22']
_all = g.mdb.find('userinfo')
_con = g.GC['pre_task']
_nt = g.C.NOW()
_ele = {'isreceive': 0,'lasttime': _nt, 'ctime': _nt, 'nval': 0}
_hidList = '11011,11023,11033,12013,13012,13023,14013,22012,23013,23023,24013,25011,25023,25033,31012,31023,31033,32011,32023,35013,35023,41013,41023,43012,43023,44011,45013,45023,52013,64013,11044,11045,11054,11055,11064,11065,15014,15015,15024,15025,21014,21015,21024,21025,22024,22025,25044,25045,25054,25055,31044,31045,31054,31055,31064,31065,33014,33015,34014,34015,41034,41035,41044,41045,43034,43035,44024,44025,45034,45035,52024,52025,52034,52035,61014,61015,63014,63015'.split(',')
for i in _all:
    uid = i['uid']
    g.m.herofun.reSetAllHeroBuff(uid, {'hid':{'$in':_hidList}})

    _taskList = []
    uid = i['uid']
    _topHero = g.mdb.find('hero', {'uid': uid}, fields=['zhanli'], sort=[["zhanli", -1]], limit=6)
    _res = sum(map(lambda x:x['zhanli'], _topHero))
    g.mdb.update('userinfo',{'uid':uid},{'maxzhanli':_res})

    _tasks = g.mdb.find('task', {'uid':uid, 'type':1},fields=['_id','taskid'])
    _idList = map(lambda x:x['taskid'], _tasks)
    for k,v in _con['1'].items():
        if not v['pretask'] and k in ['112001','113001','114001','115001']:
            _temp = _ele.copy()
            _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                          'type': v['type'], 'stype': v['stype'],'uid':uid})
            _taskList.append(_temp)

    for k,v in _con['2'].items():
        if not v['pretask'] and k in _dailyTaskList:
            _temp = _ele.copy()
            _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                          'type': v['type'], 'stype': v['stype'],'uid':uid})
            _taskList.append(_temp)

    g.mdb.insert('task', _taskList)

    a = g.mdb.count('task',{'uid':uid,'type':1,'isreceive':1})
    if a and 'success' not in g.getGud(uid):
        g.getPrizeRes(uid, [{'a':'attr','t':'success','n':10*a}])

    if hdid:
        g.mdb.update('hddata',{'uid':uid,'hdid':hdid},{'maxzhanli':g.getGud(uid)['maxzhanli']})

print 'ok...............'