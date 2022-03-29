#!/usr/bin/python
#coding:utf-8

'''
神器模块
'''
import g

# 获取神器信息
def getArtifactInfo(uid,where=None,**kwargs):
    _w = {'uid': uid}
    if where: _w.update(where)
    _keys = 'artifact_' + str(uid)
    _res = g.mc.get(_keys)
    if not _res:
        _res = g.mdb.find1('artifact',_w,fields=['_id'])
        if _res:
            g.mc.set(_keys, _res, 3600*5)

    return _res

# 设置神器信息
def setArtifactInfo(uid, data):
    _w = {'uid': uid}
    _nt = g.C.NOW()
    _data= {}
    for i in data:
        if i.startswith('$'):
            if '$set' == i:
                _data['$set'].update({'lasttime': _nt})
            else:
                _data['$set'] = {'lasttime': _nt}
        else:
            _data.update({'lasttime': _nt})
    _data.update(data)
    g.mdb.update('artifact',_w,_data)
    # 更新缓存
    _info = g.mdb.find1('artifact',_w,fields=['_id'])
    _keys = 'artifact_' + str(uid)
    g.mc.set(_keys, _info, 3600 * 5)



# 通过等级和等阶获取要返回的材料
def getRecastPrize(lv, dengjie):
    _con = g.GC['shenqicom']['base']
    _lvNeed = _con['lvneed']
    _dengjieNeed = _con['dengjieneed']
    _filter = _con['filterattr']
    _res = []
    for i in xrange(1, lv):
        _prize = [i for i in _lvNeed[str(i)] if i['t'] != _filter]
        _res.extend(_prize)

    for i in xrange(0, dengjie):
        _prize = [i for i in _dengjieNeed[str(i)] if i['t'] != _filter]
        _res.extend(_prize)

    return g.fmtPrizeList(_res)

# 获取当前神器章节的所有任务
def getAllZjTask(uid, id):
    _typeList = g.GC['shenqitask'][str(id)].keys()
    _w = {'uid':uid, 'ctype':{'$in': _typeList}}
    _allTask = g.m.statfun.getStatInfo(_w, keys='_id,v,ctype,finish')
    _res = {}
    for i in _allTask:
        _temp = {'val': i['v'],'finish': i.get('finish', 0)}
        _res[i['ctype']] = _temp

    return _res

# 监听神器对应任务
def onArtifactTask(uid,ctype,val=1,isinc=1,cond=None):
    gud = g.getGud(uid)
    zj = gud.get('artifact', 0) + 1
    # 判断是否是已完成的神器章节
    _con = g.GC['shenqitask']
    if str(zj) not in _con:
        return
    _w = {'uid':uid, 'ctype': ctype}
    # 如果存在cond
    if cond:
        for i in _con:
            for type,ele in _con[i].items():
                if ele['cond'] and type == ctype:
                    _w.update({'k': ele['cond'][0]})
                    break
        if 'k' not in _w:
            return

    _nt = g.C.NOW()
    if isinc:
        _setData = {'$inc': {'v': val},'$set':{'lasttime': _nt}}
        g.mdb.update('stat', _w, _setData, upsert=True)
    else:
        _setData = {'lasttime': _nt,'v': val}
        g.m.statfun.setStatByMax(uid,ctype,val)
    # 任务处在当前章节  监听红点
    _con = g.GC['shenqitask'][str(zj)]
    if ctype in _con:
        _taskInfo = g.mdb.find1('stat',_w)
        _taskPval = _con[ctype]['val']
        if _taskPval <= _taskInfo['v']:
            g.m.mymq.sendAPI(uid, 'artifact_redpoint', ctype)


# 获取技能等阶提供的buff
def getBuffByDengjie(sqid, lv):
    sqid = str(sqid)
    _con = g.GC['shenqicom']['shenqi'][sqid]['skillbuff']
    _lvList = [int(i) for i in _con]
    _res = {}
    for i in sorted(_lvList):
        if lv < i:
            break
        _res.update(_con[str(i)])
    return _res



g.event.on('artifact', onArtifactTask)

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    print getBuffByDengjie('5', 16)