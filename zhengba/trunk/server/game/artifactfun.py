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

    if _res:
        # 获取当前的技能等级之和
        djlvsum = 0
        for aid, info in _res["artifact"].items():
            djlvsum += info["djlv"]

        _res["djlvsum"] = djlvsum

    return _res

# 设置神器信息
def setArtifactInfo(uid, data):
    _w = {'uid': uid}
    _nt = g.C.NOW()
    _keyList = [tmp for tmp in data if '$' in tmp]
    if '$set' in data:
        data['$set']['lasttime'] = g.C.NOW()
    elif not _keyList:
        data['lasttime'] = g.C.NOW()
    else:
        data['$set'] = {'lasttime': g.C.NOW()}
    g.mdb.update('artifact',_w,data)
    # 更新缓存
    _info = g.mdb.find1('artifact',_w,fields=['_id'])
    _keys = 'artifact_' + str(uid)
    g.mc.set(_keys, _info, 3600 * 5)



# 通过等级和等阶获取要返回的材料
def getRecastPrize(zj, lv, dengjie, jxlv, rank):
    _con = g.GC['shenqicom']
    _lvNeed = _con['base']['lvneed'][_con['shenqi'][zj]['lvuptype']]
    _dengjieNeed = _con['base']['dengjieneed'][_con['shenqi'][zj]['lvuptype']]
    _filter = _con['base']['filterattr']
    _res = []
    # 升级的消耗
    for i in xrange(1, lv):
        _prize = [i for i in _lvNeed[str(i)] if i['t'] != _filter]
        _res.extend(_prize)

    # 升阶的消耗
    for i in xrange(0, dengjie):
        _prize = [i for i in _dengjieNeed[str(i)] if i['t'] != _filter]
        _res.extend(_prize)

    # 觉醒的消耗
    for i in xrange(1, jxlv + 1):
        _res += list(_con['base']['wake'][_con['shenqi'][zj]['waketype']][str(i)]['need'])
        _res.append({'a': 'item', 't':_con['shenqi'][zj]['needitem'], 'n': _con['base']['wake'][_con['shenqi'][zj]['waketype']][str(i)]['itemnum']})

    # 觉醒的消耗
    for i in xrange(1, rank + 1):
        _res += list(_con['wakerank'][str(i)]['need'])
        _res.append({'a': 'item', 't':_con['shenqi'][zj]['needitem'], 'n': _con['wakerank'][str(i)]['itemnum']})

    return g.fmtPrizeList(_res)

# 获取当前神器章节的所有任务
def getAllZjTask(uid, sid):
    if str(sid) not in g.GC['shenqitask']:
        return {}
    _typeList = g.GC['shenqitask'][str(sid)].keys()
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

# 获取神器的战斗信息
def getFightInfo(uid, side, sqid):
    # 携带神器战斗
    _shenqiBuff = {}
    _res = []
    if sqid:
        sqid = str(sqid)
        _artifactInfo = getArtifactInfo(uid, fields=['_id'])
        if _artifactInfo and sqid in _artifactInfo['artifact']:
            _artifactInfo = _artifactInfo['artifact'][sqid]
            _dengjie = _artifactInfo['djlv']
            _shenqiBuff.update(g.GC['shenqibuff'][sqid][str(_artifactInfo['lv'])]['buff'])
            _djBuff = g.m.artifactfun.getBuffByDengjie(sqid, _dengjie)
            _shenqiBuff.update(_djBuff)
            # 加上觉醒buff
            _sqNum = g.GC['shenqicom']['base']['wake'][g.GC['shenqicom']['shenqi'][sqid]['waketype']][str(_artifactInfo.get('jxlv',0))]['shenqidpspro'] +\
                     g.GC['shenqicom']['wakerank'][str(_artifactInfo.get('rank',0))]['shenqidpspro']
            _res.append({'sqid': sqid, 'side': side, 'djlv': _dengjie, 'shenqidpspro': _sqNum})
    return _res, _shenqiBuff


# 获取神器共鸣激活状态
def getResonance(uid):
    _res = 0
    _ctype = "artifact_resonance"
    _w = {"ctype": _ctype}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
    return _res

# 激活神器共鸣状态
def setResonance(uid):
    _ctype = "artifact_resonance"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": 1})


# 检查是否开启神器共鸣
def chkResonance(uid, artifactInfo):
    _res = 0
    if not artifactInfo:
        return _res

    _con = g.GC["shenqicom"]["base"]["resonance"]
    _num = 0
    for aid, info in artifactInfo["artifact"].items():
        if info["djlv"] >= _con["actdjlv"]:
            _num += 1
    # 判断是否达到共鸣条件， 设置共鸣状态
    if _num >= _con["num"]:
        setResonance(uid)
        _res = 1

    return _res

g.event.on('artifact', onArtifactTask)

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    a = g.m.artifactfun.getArtifactInfo(uid, fields=['_id'])
    print a