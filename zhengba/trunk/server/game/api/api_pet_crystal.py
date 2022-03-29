#!/usr/bin/python
# coding:utf-8
'''
宠物 - 水晶升级
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [升级类型:str]
    :return:
    ::

        {'d': {水晶数据}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _type = data[0]
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    _pet = g.mdb.find1('crystal', {'uid': uid}, fields=['crystal','_id']) or {}
    _crystal = _pet.get('crystal', {})
    _crystal[_type] = _crystal.get(_type, 0)
    # 升级
    if _type == 'lv':
        # 满级了
        if str(_crystal[_type] + 1) not in g.GC['crystal']:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData

        # 升级限制
        if _crystal[_type] + 1 > _con['crystalrank'][str(_crystal.get('rank',0) + 1)]['lv']:
            _chkData['s'] = -6
            _chkData['errmsg'] = g.L('pet_crystal_-6')
            return _chkData

        _need = g.GC['crystal'][str(_crystal[_type])]['need']
    else:
        # 满级了
        if str(_crystal[_type] + 1) not in _con['crystalrank']:
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData

        # 等级不足
        if _crystal.get('lv',0) < _con['crystalrank'][str(_crystal[_type] + 1)]['lv']:
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('pet_crystal_-5')
            return _chkData

        _need = _con['crystalrank'][str(_crystal[_type])]['need']

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chk['t']
        else:
            _chkData["s"] = -104
            _chkData[_chk['a']] = _chk['t']
        return _chkData

    _crystal[_type] += 1
    _chkData['data'] = _crystal
    _chkData['con'] = _con
    _chkData['need'] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _delData = g.delNeed(uid, _chkData['need'], 0, {'act':'pet_crystal','cost':_chkData['need'],'lv':_chkData['data']})
    g.sendChangeInfo(conn, _delData)

    g.mdb.update('crystal', {'uid': uid}, {'$inc': {'crystal.{}'.format(data[0]): 1}},upsert=True)
    # 升阶需要计算所有英雄的buff
    _buff = {}
    for key,val in g.GC['crystal'][str(_chkData['data']['lv'])]['buff'].items():
        _buff[key] = _buff.get(key, 0) + val

    for key,val in _chkData['con']['crystalrank'][str(_chkData['data'].get('rank', 0))]['buff'].items():
        _buff[key] = _buff.get(key, 0) + val

    _pro = _chkData['con']['crystalrank'][str(_chkData['data'].get('rank', 0))]['pro']
    for key in _buff:
        _buff[key] = int(_buff[key] * _pro / 1000.0)

    g.m.userfun.setCommonBuff(uid, {'buff.crystal': [_buff]})
    _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv':{'$gt': 1}}) or {}
    g.sendChangeInfo(conn, {'hero': _r})

    _res['d'] = _chkData['data']
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['lv'])