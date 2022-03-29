#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
装备 - 装备出售
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 装备tid
    tid = data[0]
    # 装备类型 5是饰品  1234是装备
    _type = data[1] if data[1] == '5' else '1'
    # 装备数量
    _num = int(data[2])
    _typeData = {
        '1':{'name':'equiplist', 'chkid':'eid',"con":g.m.equipfun.getEquipCon,'func':g.m.equipfun.changeEquipNum,'sendname':'equip'},
        '5':{'name':'shipin', 'chkid':'spid',"con":g.m.shipinfun.getShipinCon,'func':g.m.shipinfun.changeShipinNum,'sendname':'shipin'}
    }
    # 参数有误
    if _num <= 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('equip_sale_res_-2')
        return _res

    _tbName = _typeData[_type]['name']
    _Info = g.mdb.find1(_tbName,{'uid':uid,'_id':g.mdb.toObjectId(tid)})
    # 装备不存在
    if not _Info:
        _res['s'] = -1
        _res['errmsg'] = g.L('equip_sale_res_-1')
        return _res

    # 装备类型需要判断使用次数
    if _type == '1'  and _Info['num'] < _num + _Info.get('usenum',0):
        _res['s'] = -3
        _res['errmsg'] = g.L('equip_sale_res_-3')
        return _res

    _chkId = _typeData[_type]['chkid']
    eid = _Info[_chkId]
    _Con = _typeData[_type]['con'](eid)
    _sale = _Con['sale']
    _prizeList = []
    if not isinstance(_sale, list) and not isinstance(_sale, tuple): _sale = [_sale]
    for i in _sale:
        i['n'] *= _num
        _prizeList.append(i)

    _equipData = _typeData[_type]['func'](uid, eid, -_num)
    _sendData = g.getPrizeRes(uid, _prizeList,act='equip_sale')
    _sendData[_typeData[_type]['sendname']].update(_equipData)
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prizeList}
    return _res

if __name__ == "__main__":
    uid = g.buid("1111")
    g.debugConn.uid = uid
    data = ["5bb2e22ec0911a20c84ddca3","2",3]
    _r = doproc(g.debugConn, data)
    print _r