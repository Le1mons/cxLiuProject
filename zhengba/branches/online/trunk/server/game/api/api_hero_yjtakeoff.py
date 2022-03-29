#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄 - 一键打赤膊
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄唯一id
    tid = data[0]

    _wearData = g.m.herofun.getUserwearInfo(uid, tid)
    # 英雄无穿戴装备
    if not _wearData:
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_yjtakeoff_res_-1')
        return _res
    _spInfo,_eqInfo = {},{}
    for _type,eid in _wearData.items():
        if _type == '6': continue
        _offEquipData = g.m.herofun.takeOffUserWear(uid, tid, _type, eid)
        
        # 如果有饰品的存在
        if _type == '5':
            #_shipinInfo = g.m.shipinfun.getShipinInfo(uid, eid)
            #if _shipinInfo:
                #_tid = str(_shipinInfo['_id']); del _shipinInfo['_id']
                #_spInfo[_tid] = _shipinInfo
            _spInfo.update(_offEquipData)
        else:
            _eqInfo.update(_offEquipData)
            
            #_eqData = g.m.equipfun.getEquipInfo(uid, eid)
            #_tid = str(_eqData['_id']); del _eqData['_id']
            #_eqInfo[_tid] = _eqData
        del _wearData[_type]


    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid)
    _heroBuff[tid]['weardata'] = _wearData
    g.sendChangeInfo(conn, {'hero': _heroBuff,'shipin': _spInfo,'equip':_eqInfo})
    g.event.emit('JJCzhanli', uid, tid)
    _res['d'] = {'hero': _heroBuff}
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc5a16daeddbf2bc8b76926'])