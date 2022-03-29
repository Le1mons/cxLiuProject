#!/usr/bin/python
# coding:utf-8
'''
宠物 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {'pet':[{pid: 宠物id，lv:宠物等级}], 'crystal': {'petridish':{
                                                                    "1":{"time":第1个孵化室结束时间,'id':宠物id}
                                                                    "2":{"time":第2个孵化室结束时间,'id':宠物id}},
                                                            'crystal':{'lv':水晶等级, 'rank': 水晶等阶}}}
                                                            'palace': 0 殿堂激活 然后是0级
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _isPet = bool(data[0])
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if not _isPet and g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _resData = {}
    _crystal = g.mdb.find1('crystal', {'uid': uid}, fields={'_id': 0}) or {'petridish': {},'crystal': {'lv': 0, 'rank': 0}}
    _resData['crystal'] = _crystal
    _resData['buynum'] = g.getPlayAttrDataNum(uid, 'pet_dailybuynum')
    _resData['receive'] = _crystal.get('date') != g.C.DATE(g.C.NOW()) and _crystal.get('pay', 0) > g.C.NOW()

    if data[0]:
        _comcon = g.GC['petcom']['base']['palace']
        _con = g.GC['pet']
        _pet = g.mdb.find('pet', {'uid': uid}, fields=['lv', 'pid', 'lock']) or []
        _resData['pet'] = {}
        for i in _pet:
            _resData['pet'][str(i.pop('_id'))] = i

            # 品质等级都满足 并且没有激活过
            if not _crystal.get('palace') and _con[i['pid']]['color'] >= _comcon['color'] and i['lv'] >= _comcon['lv']:
                _crystal['palace'] = 1
                g.mdb.update('crystal', {'uid': uid}, {'palace': 1}, upsert=True)

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1"])