#!/usr/bin/python
# coding:utf-8
'''
宠物 - 强化
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [宠物tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    # 宠物tid
    _pid = data[0]
    _pet = g.mdb.find1('pet',{'uid': uid,'_id':g.mdb.toObjectId(_pid)},fields=['pid','lv'])
    # 数据不存在
    if not _pet:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _con = g.GC['petupgrade'][_pet['pid']]
    # 升满级了
    if str(_pet['lv'] + 1) not in _con:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _need = _con[str(_pet['lv'])]['need']
    _chk = g.chkDelNeed(uid, _need, str(_pet['_id']))
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chk['t']
        else:
            _chkData["s"] = -104
            _chkData[_chk['a']] = _chk['t']
        return _chkData

    _chkData['data'] = _pet
    _chkData['need'] = _need
    _chkData['con'] = _con
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _delData = g.delNeed(uid, _chkData['need'], 0, {'act': 'pet_upgrade'}, str(_chkData['data']['_id']))
    g.mdb.update('pet', {'uid': uid,'_id':_chkData['data']['_id']}, {'$inc': {'lv': 1}})

    _chkData['data']['lv'] += 1

    _con = g.GC['petcom']['base']['palace']
    # 需要判断是否激活殿堂
    if _chkData['data']['lv'] >= _con['lv'] and g.GC['pet'][_chkData['data']['pid']]['color'] >= _con['color']:
        _crystal = g.mdb.find1('crystal', {'uid': uid}, fields={'palace': 1,'_id':0})
        if not _crystal:
            g.mdb.update('crystal', {'uid': uid}, {'palace': 0}, upsert=True)

    g.mergeDict(_delData, {'pet': {data[0]: {'lv': _chkData['data']['lv']}}})
    g.sendChangeInfo(conn, _delData)

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5e9052c09dc6d67cf830b146'])