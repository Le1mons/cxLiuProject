#!/usr/bin/python
# coding:utf-8
'''
宠物 - 分解
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

        {"d": {'prize': []}
        's': 1}

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
    _pids = data
    _pets = g.mdb.find('pet',{'uid': uid,'_id': {'$in': map(g.mdb.toObjectId, _pids)}},fields=['pid','lv',"lock"])
    # 数据不存在
    if not _pets:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _petCon = g.GC['pet']
    for i in _pets:
        # 等级不足
        if _petCon[i['pid']]['color'] >= 4 and not g.chkOpenCond(uid, 'pet'):
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('global_limitlv')
            return _chkData

        # 判断上锁
        if i.get("lock", 0) == 1:
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('pet_lock_-1')
            return _chkData


    # 上阵的不能分解
    if set(g.m.petfun.getPlayPet(uid).values()) & set(_pids):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('pet_breakdown_-4')
        return _chkData

    # 红的不能分解
    if filter(lambda x:g.GC['pet'][x['pid']]['color'] >= 5, _pets):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('pet_breakdown_-5')
        return _chkData

    _chkData['data'] = _pets
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _sendPets = {}
    _prize = []
    for i in _chkData['data']:
        _prize += g.GC['petupgrade'][i['pid']][str(i['lv'])]['prize']
        _sendPets[str(i['_id'])] = {'num': 0}

    _prize = g.fmtPrizeList(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act':"pet_breakdown",'pets':_chkData['data']})
    g.mergeDict(_send, {'pet': _sendPets})
    g.sendChangeInfo(conn, _send)

    g.mdb.delete('pet', {'uid': uid,'_id': {'$in': map(lambda x:x['_id'], _chkData['data'])}})
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5dba4e94dfcde633dce7d894'])