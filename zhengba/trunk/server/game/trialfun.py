#!/usr/bin/python
#coding:utf-8

'''
试炼活动模块
'''
import g

# 获取配置
def getCon():
    if g.getOpenTime() < 1581696000:
        return g.GC['trial1']
    else:
        return g.GC['trial']

# 获取任务
def getDataByType(uid, ttype):
    _data = g.mdb.find1('trial', {'uid': uid,'type':ttype}, fields=['_id', 'task', 'receive'])
    if not _data:
        _con = g.m.trialfun.getCon()[ttype]['task']
        _task = {}
        for tid, item in _con.items():
            # 英雄
            if ttype == '1':
                _task[tid] = g.mdb.count('hero',{'uid':uid,'star':{'$gte':item['cond']}})
            # 神器
            elif ttype == '2':
                _jifen = 0
                _artifactInfo = g.m.artifactfun.getArtifactInfo(uid, fields=['_id'])
                if _artifactInfo:
                    _maxID = max(_artifactInfo['artifact'], key=lambda x:_artifactInfo['artifact'][x]['djlv'])
                    _jifen = _artifactInfo['artifact'][_maxID]['djlv']
                _task[tid] = _jifen
            # 融魂
            elif ttype == '3':
                _task[tid] = g.mdb.count('hero',{'uid':uid,'meltsoul':{'$gte':item['cond']}})
            else:
                _task[tid] = g.getGud(uid)['title']

        _data = {'task': _task, 'receive': []}
        g.mdb.update('trial',{'uid':uid,'type':ttype},{'task': _task},upsert=True)

    return _data

# 监听试炼活动
def onTrialTask(uid, ttype, cond=1, val=1):
    if g.getOpenTime() < g.GC['timestamp']['trial']:
        return
    _con = g.m.trialfun.getCon()

    _data = getDataByType(uid, ttype)
    _set = {}
    for tid,ele in _con[ttype]['task'].items():
        if ttype in ('1','3') and cond != ele['cond']:
            continue
        if ttype == '3':
            _data['task'][tid] = _set['task.' + tid] = g.mdb.count('hero', {'uid': uid, 'meltsoul': {'$gte': cond}})
        # 如果是神器  只记录最大值
        elif (ttype == '2' and val > _data['task'][tid]) or ttype != '2':
            _data['task'][tid] = _set['task.' + tid] = _data['task'][tid] + val if ttype not in  ('2','4') else val

    if _set:
        g.mdb.update('trial',{'uid':uid,'type':ttype},_set,upsert=True)
        if ttype == getWeek():
            for tid, ele in _con[ttype]['task'].items():
                # 推送红点

                if _data['task'][tid] + val >= ele['pval'] and tid not in _data.get('receive', []):
                    g.m.mymq.sendAPI(uid, 'trial_redpoint', tid)
                    return

# 获取红点
def getHongDian(uid):
    _con = g.m.trialfun.getCon()
    _day = g.getOpenDay()
    _type = ''
    for i in _con:
        if _con[i]['day'][0] <= _day <= _con[i]['day'][1]:
            _type = i
            break
    else:
        return {'trial': False}

    _data = getDataByType(uid, _type)
    for tid,ele in _con[_type]['task'].items():
        if tid in _data['task'] and _data['task'][tid] >= ele['pval'] and tid not in _data.get('receive', []):
            return {'trial': True}
    return {'trial': False}

# 获取第几周
def getWeek():
    _con = g.m.trialfun.getCon()
    _day = g.getOpenDay()
    _type = ''
    for i in _con:
        if _con[i]['day'][0] <= _day <= _con[i]['day'][1]:
            _type = i
            break
    return _type


g.event.on('trial', onTrialTask)

if __name__ == '__main__':
    print onTrialTask(g.buid('xuzhao1'), '2', val=1)