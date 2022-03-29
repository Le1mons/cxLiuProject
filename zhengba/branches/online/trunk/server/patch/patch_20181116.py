#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
# 删除日常任务
_delList = ['2', '11', '3', '7']
g.mdb.delete('task', {'taskid': {'$in': _delList}},RELEASE=1)

_dailyTaskList = ['12', '13', '14', '15', '17', '16','18','19']
_all = g.mdb.find('userinfo')
_con = g.GC['pre_task']
_nt = g.C.NOW()
_ele = {'isreceive': 0,'lasttime': _nt, 'ctime': _nt, 'nval': 0}
for i in _all:
    _taskList = []
    uid = i['uid']
    _topHero = g.mdb.find('hero', {'uid': uid}, fields=['zhanli'], sort=[["zhanli", -1]], limit=6)
    _res = sum(map(lambda x:x['zhanli'], _topHero))
    g.mdb.update('userinfo',{'uid':uid},{'maxzhanli':_res},RELEASE=1)

    _tasks = g.mdb.find('task', {'uid':uid, 'type':1},fields=['_id','taskid'])
    _idList = map(lambda x:x['taskid'], _tasks)
    for k,v in _con['1'].items():
        if not v['pretask'] and k not in _idList:
            _temp = _ele.copy()
            _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                          'type': v['type'], 'stype': v['stype'],'uid':uid})
            _taskList.append(_temp)

    for k,v in _con['2'].items():
        if not v['pre_task'] and k in _dailyTaskList:
            _temp = _ele.copy()
            _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                          'type': v['type'], 'stype': v['stype'],'uid':uid})
            _taskList.append(_temp)

    g.mdb.insert('task', _taskList)



print 'ok...............'