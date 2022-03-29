#!/usr/bin/python
# coding:utf-8

if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g

'''
遗迹考古
'''
def getMyData(uid, **kwargs):
    _w = {
        "uid": uid
    }

    _myData = g.mdb.find1("yjkg", _w, **kwargs)
    if _myData is None:
        _myData = {
            "uid": uid,"unlockmap": ["1"],
            "yiqi": {'speed': 0, 'exp': 0},"farthest": {},
            "data": {},"exp": 0,
            "energe": 0,"skill":{},
            "milestone":{},"key":"",
            "milage":{},"num":{}

        }
        g.mdb.insert("yjkg", _myData)
        del _myData['_id']

    return _myData


# 初始化考古数据
def initKgData(uid, mapid, data, isjiasu, isdouble):
    con = g.GC['yjkg']

    _nt = g.C.NOW()
    _qyCon = con["map"][mapid]

    # 考古速度
    speed = exp = 1
    # 马车加成
    if isjiasu:
        speed += con["jiasuneed"][2]

    # 仪器加成
    if data['yiqi']['speed'] > 0:
        speed += con['yiqi']['speed'][str(data['yiqi']['speed'])]['add']

    if data['yiqi']['exp'] > 0:
        exp += con['yiqi']['exp'][str(data['yiqi']['exp'])]['add']

    _skills = data['skill'].get(mapid, [])
    _kgData = {
        "supply": _qyCon['supply'] + getSkillSupply(mapid, _skills, "1") if not isdouble else 2 * (_qyCon['supply'] + getSkillSupply(mapid, _skills, "1")) ,  # 加上技能提供的补给
        "ctime": _nt,  # 开始考古的时间
        "mapid": mapid,  # 考古的区域
        "speedup":isjiasu,
        "double":isdouble, # 是否双倍
        "speed": (speed + getSkillSupply(mapid, _skills, "5")) * con['speed'],  # 速度加成
        "jiacheng":speed + getSkillSupply(mapid, _skills, "5") - 1,
        "exp": exp * _qyCon['exp'],  # 经验加成
        "energepro": getSkillSupply(mapid, _skills, "4"),  # 经验加成
        "skill":filter(lambda x:g.GC['yjkgskill'][mapid][x]['type'] in ('2','3','6','7'),_skills) # 此时的技能状态
    }

    return _kgData

# 获取技能提供的补给
def getSkillSupply(map, skills, type):
    _res = 0
    _skill = []
    _con = g.GC['yjkgskill'][map]
    for i in skills:
        # 增加补给
        if _con[i]['type'] == type == "1":
            _res += _con[i]['num']
        # 能源百分比
        elif _con[i]['type'] == type == "4":
            _res += _con[i]['pro'] / 1000.0
        # 考古速度百分比
        elif _con[i]['type'] == type == "5":
            _res += _con[i]['pro'] / 1000.0
    return _res

# 获取展览馆数据
def getExhibitionData(uid):
    _res = g.mdb.find1('exhibition', {'uid': uid}, fields=['_id'])
    if not _res:
        _con = g.GC['yjkg']['exhibition']
        _res = {'data': {}, 'ctime':g.C.NOW(),'uid':uid,'rec':[]}
        for qy, ele in _con.items():
            _res['data'][qy] = [0 for i in ele['data']]
        g.mdb.insert('exhibition', _res)
        del _res['_id']

    return _res

# 删除文物
def delWenwu(uid, wid, num):
    _wenwu = g.mdb.find1('wenwu',{'uid':uid,'wid':wid},fields=['num'])
    _wenwu['num'] += num
    if _wenwu['num'] <= 0:
        g.mdb.delete('wenwu', {'uid': uid, 'wid': wid})
    else:
        g.mdb.update('wenwu',{'uid':uid,'wid':wid},{'num': _wenwu['num']})
    return {str(_wenwu['_id']): {'num': _wenwu['num']}}

# 增加文物
def addWenwu(uid, wid, num=1):
    _wenwu = g.mdb.find1('wenwu',{'uid':uid,'wid':wid},fields=['num'])
    if not _wenwu:
        _wenwu = {'uid':uid,'wid':wid,'num':num}
        g.mdb.insert('wenwu', _wenwu)
    else:
        _wenwu['num'] += num
        g.mdb.update('wenwu',{'uid':uid,'wid':wid},{'num': _wenwu['num']})
    return {str(_wenwu['_id']): {'num': _wenwu['num'], 'wid': wid}}

# 红点
def getHongDian(uid):
    _res = 0
    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        return {'yjkg': _res}

    _data = getMyData(uid)
    # 当今日存在免费的“地精商人”宝箱时
    if _data['key'] != g.C.DATE():
        _res = 1
    # 可领取里程碑奖励
    else:
        for mapid in _data['farthest']:
            for idx,i in enumerate(_con['milestone'][mapid]):
                if _data['farthest'][mapid] > i[0] and idx not in _data['milestone'].get(mapid,[]):
                    _res = 1
                    return {'yjkg': _res}

        if _data['data']:
            _time = int(_con['map'][_data['data']['mapid']]['distance'] / _data['data']['speed'])
            # 补给不够达到终点
            if g.C.CEIL(_time / 60.0) * _con['supply'] > _data['data']['supply']:
                # 现在时间超过补给时间
                if g.C.NOW() > _data['data']['supply'] / _con['supply'] * 60 + _data['data']['ctime']:
                    _res = 1
            elif g.C.NOW() >= _time + _data['data']['ctime']:
                _res = 1

    return {'yjkg': _res}

# 获取考古状态
def getYjkgStatus(uid):
    _con = g.GC['yjkg']
    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,data".split(','))

    # 没有考古
    if not _myData['data']:
        return 0
    # 考古中
    else:
        _nt = g.C.NOW()
        # 走完的时间 秒
        _time = int(_con['map'][_myData['data']['mapid']]['distance'] / _myData['data']['speed'])
        # 补给不够达到终点
        if g.C.CEIL(_time / 60.0) * _con['supply'] > _myData['data']['supply']:
            # 现在时间超过补给时间
            if _nt > _myData['data']['supply'] / _con['supply'] * 60 + _myData['data']['ctime']:
                return 2
            else:
                return 1
        # 还没到时间
        else:
            # 补给完了
            if _nt >= _time + _myData['data']['ctime']:
                return 2
            else:
                return 1




if __name__ == "__main__":
    uid = g.buid('xuzhao')
    print getHongDian(uid)