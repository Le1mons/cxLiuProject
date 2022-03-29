#!/usr/bin/python
#coding:utf-8
import g
'''
趣味成就相关方法
'''
_type2ids = {}
for i, j in g.GC['qwcj'].items():
    if str(j['type']) not in _type2ids:
        _type2ids[str(j['type'])] = [i]
    else:
        _type2ids[str(j['type'])].append(i)

# 获取趣味成就的数据
def getQwcjData(uid):
    _con = g.GC['qwcj']
    def updateData(array, Tid, num):
        if not array:
            _val = 0
        else:
            _val = 0
            for i in xrange(num):
                _val = _val + 1 if i in array else 0

        for _id in _type2ids[Tid]:
            if _res['nval'].get(_id, 0) >= _con[_id]['pval']:
                continue
            _set['nval.{}'.format(_id)] = _val
            _res['nval'][_id] = _val

    _set = {}
    _res = g.mdb.find1('qwcj',{'uid':uid},fields=['nval','key', 'data', '_id','receive']) or {}
    _qwcjCross = g.crossDB.find1('crossconfig', {'ctype': 'qwcj'}) or {'v': {}}
    _qwcj = g.mdb.find1('gameconfig', {'ctype': 'qwcj'}) or {'v': {}}
    _data = g.crossDB.find1('crossplayattr', {'uid': uid, 'ctype': 'qwcj_data'}) or {'v': {}}

    if 'nval' not in _res: _res['nval'] = {}

    # 大预言家
    if '3' in _type2ids:
        _list = _res.get('data',{}).get('3', [])
        updateData(_list, '3', _qwcjCross['v'].get('wz',0))

    # 连续获得魔王幸运奖
    if '11' in _type2ids:
        _list = _res.get('data',{}).get('11', [])
        updateData(_list, '11', _qwcj['v'].get('mw',0))

    # 连需获得王者冠军
    if '12' in _type2ids:
        _list = _data['v'].get('wz', [])
        updateData(_list, '12', _qwcjCross['v'].get('wz',0))

    # 每日试炼的暴击
    if '7' in _type2ids:
        if _res.get('key',{}).get('7') != g.C.DATE(g.C.NOW()):
            for _id in _type2ids['7']:
                if _id in _res.get('receive',[]) or _res['nval'].get(_id, 0) >= _con[_id]['pval']:
                    continue
                _set['nval.{}'.format(_id)] = 0
            _set['key.7'] = g.C.DATE(g.C.NOW())

    # 王者荣耀伤害为0的战斗
    if '14' in _type2ids:
        for _id in _type2ids['14']:
            if _res['nval'].get('14', 0) < _data['v'].get('dps', 0) and _res['nval'].get(_id, 0) < _con[_id]['pval']:
                _res['nval'][_id] = _data['v'].get('dps', 0)
                _set['nval.{}'.format(_id)] = _data['v'].get('dps', 0)

    # 域外争霸连续冠军
    if '15' in _type2ids:
        _list = _data['v'].get('zb', [])
        updateData(_list, '15', _qwcjCross['v'].get('zb',0))

    for i in ('13', '18', '19'):
        for _id in _type2ids.get(i, []):
            if _id not in _res.get('receive', []) and _res['nval'].get(_id, 0) < _con[_id]['pval']:
                _set['nval.{}'.format(_id)] = _res['nval'][_id] = _res.get('data',{}).get(i,0)

    if _set:
        g.mdb.update('qwcj', {'uid': uid}, _set, upsert=True)
    return _res


# 增加雕纹
def onQuWeiChengJiu(uid, tid, val=1):
    if tid not in _type2ids:
        return

    _con = g.GC['qwcj']
    _data = getQwcjData(uid)
    _idx = _type2ids[tid]
    _gt = ('8', '5', '6', '10')
    _set = {}
    for _id in _idx:
        if _data['nval'].get(_id, 0) >= _con[_id]['pval']:
            continue

        # 处理最大值
        if tid in _gt:
            if val > _data['nval'].get(_id, 0):
                _set['nval.{}'.format(_id)] = val
        # 纯增加
        elif _data['nval'].get(_id, 0) + val >= 0:
            _set['nval.{}'.format(_id)] = _data['nval'].get(_id, 0) + val


    if _set:
        g.mdb.update('qwcj', {'uid':uid}, _set,upsert=True)

# 提交战斗的时间
def emitFightEvent(uid, fightres, data):
    # 趣味成就
    g.event.emit('quweichengjiu', uid, '5', fightres['signdata'][max(fightres['signdata'], key=lambda x:fightres['signdata'][x].get('buffnum',0))]['buffnum'])
    g.event.emit('quweichengjiu', uid, '6', fightres['signdata'][max(fightres['signdata'], key=lambda x:fightres['signdata'][x].get('maxdot',0))]['maxdot'])
    g.event.emit('quweichengjiu', uid, '10', len(filter(lambda x:'skin' in x, data)))

# 获取红点
def getHongDian(uid):
    _data = getQwcjData(uid)
    _con = g.GC['qwcj']
    for tid in _data['nval']:
        if _con[tid]['pval'] <= _data['nval'][tid] and tid not in _data.get('receive', []):
            return {'qwcj': 1}
    return {'qwcj': 0}

g.event.on('quweichengjiu', onQuWeiChengJiu)


if __name__ == '__main__':
    _data = g.crossDB.find1("gpjjc_rank", {"uid":"9250_5c853735a31eba3d52d17dcc"}, fields=["_id"])
    list = g.crossDB.find("cross_friend", {"uid":{"$ne": "9250_5c853735a31eba3d52d17dcc"}}, limit=100, sort=[["zhanli", -1]], fields=["uid"])
    for i in list:
        _data["uid"] = i["uid"]
        g.crossDB.insert("gpjjc_rank", _data)
        del _data["_id"]
