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
    """

    :param conn:
    :param data: ['5d2db17c0ae9fe3a60067ac2'英雄tid]
    :return:
    ::

        {'d': {'hero'英雄属性: {'5d2db17c0ae9fe3a60067ac2': {u'atk': 7794,
                                                     u'atkdrop': 0,
                                                     u'atkpro': 1000,
                                                     u'baojidrop': 0,
                                                     u'baojipro': 0,
                                                     u'baoshangdrop': 0,
                                                     u'baoshangpro': 0,
                                                     u'def': 971,
                                                     u'defdrop': 0,
                                                     u'defpro': 1000,
                                                     u'dpsdrop': 0,
                                                     u'dpspro': 0,
                                                     u'fkdpspro': 0,
                                                     u'gedangdrop': 0,
                                                     u'gedangpro': 300,
                                                     'hid': u'25076',
                                                     u'hp': 62620,
                                                     u'hpdrop': 0,
                                                     u'hppro': 1200,
                                                     u'jianshangpro': 0,
                                                     u'jingzhundrop': 0,
                                                     u'jingzhunpro': 0,
                                                     u'miankongdrop': 0,
                                                     u'miankongpro': 0,
                                                     u'pojiadrop': 0,
                                                     u'pojiapro': 0,
                                                     u'pvpdpspro': 0,
                                                     u'pvpundpspro': 0,
                                                     u'skilldpsdrop': 0,
                                                     u'skilldpspro': 0,
                                                     u'speed': 853,
                                                     u'speeddrop': 0,
                                                     u'speedpro': 1000,
                                                     u'staratkpro': 1000,
                                                     u'starhppro': 1000,
                                                     u'unbaojipro': 0,
                                                     u'undotdpspro': 0,
                                                     u'undpsdrop': 0,
                                                     u'undpspro': 0,
                                                     'weardata': {},
                                                     'zhanli': 17463}}},
         's': 1}
    """
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
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['5d2db17c0ae9fe3a60067ac2']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
