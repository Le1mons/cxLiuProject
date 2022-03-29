#!/usr/bin/python
# coding:utf-8
'''
宠物 - 出战
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [{宠物的位置: 宠物的tid}]
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

    # 宠物的站位
    _position = data[0]
    # 有不明参数  key 不是 1234
    if set(_position.keys()) - {'1','2','3','4'}:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 有重复的
    if len(set(_position.values())) != len(_position):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('pet_play_-2')
        return _chkData

    if _position:
        _pet = g.mdb.find('pet', {'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _position.values())}}, fields=['lv', 'pid'])
        # 宠物不存在
        if len(_pet) != len(_position):
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData

        _crystal = g.mdb.find1('crystal', {'uid': uid}, fields={'crystal': 1}) or {}
        # 上多了
        if len(_position) > _con['crystalrank'][str(_crystal.get('crystal',{}).get('rank',0))]['slot']:
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('pet_play_-5')
            return _chkData

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.m.petfun.setPlayPet(uid, data[0])
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[{'1': '5dba4f3adfacae13fc5ad8a3'}])