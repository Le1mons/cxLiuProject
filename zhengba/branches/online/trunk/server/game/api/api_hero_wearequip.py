#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
装备 - 穿戴装备
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    eid = data[0]
    tid = data[1]
    _equip_info = g.m.equipfun.getEquipInfo(uid, eid)
    # 装备信息有误
    if not _equip_info:
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_wearequip_res_-1')
        return _res
    _num = _equip_info['num']
    _usenum = _equip_info['usenum']
    # 超过已有的装备数量
    if _usenum >= _num:
        _res["s"]=-3
        _res["errmsg"]=g.L('hero_wearequip_res_-3')
        return _res

    _hero_info = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄信息有误
    if not _hero_info:
        _res["s"]=-103
        _res["errmsg"]=g.L('global_heroerr')
        return _res
    _type = str(_equip_info['type'])
    _equipList = g.m.herofun.getUserwearInfo(uid, tid)

    _sendData = {}
    # 如果已穿戴装备 并且穿戴了同类型的装备
    if _equipList and _type in _equipList:
        _pre_eqid = _equipList[_type]
        # 即将穿戴的装备与已穿戴的装备相同
        if _pre_eqid == eid:
            _res['s'] = -2
            _res['errmsg'] = g.L('hero_wearequip_res_-2')
            return _res

        _preEquipInfo = g.m.equipfun.getEquipInfo(uid, _pre_eqid)
        # 之前的装备不存在
        if not _preEquipInfo:
            _res["s"]=-4
            _res["errmsg"]=g.L('hero_wearequip_res_-4')
            return _res

        _tid = str(_preEquipInfo['_id']); del _preEquipInfo['_id']; _preEquipInfo['tid'] = _tid
        _preEquipInfo['usenum'] -= 1

        if _preEquipInfo['usenum']<0:
            #异常处理，防止为负
            _preEquipInfo['usenum'] = 0
            g.m.crosssgamelog.addLog('equipUserNumLt0_1')


        g.m.equipfun.updateEquipInfo(uid, _pre_eqid, {'usenum': _preEquipInfo['usenum']})
        _sendData['equip'] = {_tid: _preEquipInfo}

    # 穿戴装备
    _wearData = g.m.herofun.setUserWearInfo(uid, tid, _type, eid)
    _eqData = g.m.herofun.updateByUserWear(uid, tid, _type, eid)
    _buffData = g.m.herofun.reSetHeroBuff(uid, tid,['equip'])
    _buffData[tid].update(_wearData)
    _sendData['hero'] = _buffData
    if 'equip' in _sendData:
        _sendData['equip'].update(_eqData)
    else:
        _sendData['equip'] = _eqData
    g.event.emit('JJCzhanli', uid, tid)
    g.sendChangeInfo(conn, _sendData)
    return _res


if __name__ == '__main__':
    uid = g.buid("lyf150")
    g.debugConn.uid = uid
    data = ["3055","5b61f37de13823200341da2e"]
    _r = doproc(g.debugConn, data)
    print _r
    # a = g.delNeed('0_5aea81d0625aee4a04a0146d', [{'a':'equip', 't': '2042', 'n': 1},{'a':'equip', 't': '4042', 'n': 1}])