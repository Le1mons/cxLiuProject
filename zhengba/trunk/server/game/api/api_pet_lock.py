#!/usr/bin/python
# coding:utf-8
'''
宠物 - 锁住
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

    _tid = str(data[0])
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    # 获取宠物
    _pet = g.mdb.find1('pet', {'uid': uid, '_id': g.mdb.toObjectId(_tid)}, fields=['lock'])
    # 宠物不存在
    if not _pet:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _chkData["pet"] = _pet
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}

    _tid = str(data[0])

    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _pet = _chkData["pet"]
    _lock = _pet.get("lock", 0)
    _setData = {}
    if _lock:
        _setData["lock"] = 0

        # 宠物不存在
    else:
        _setData["lock"] = 1
    g.mdb.update('pet', {'uid': uid, '_id': g.mdb.toObjectId(_tid)}, _setData)
    _sendData = {'pet': {_tid: _setData}}
    g.sendChangeInfo(conn, _sendData)
    _res["d"] = _setData
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["6107bfb0842c8438b85facd5"])