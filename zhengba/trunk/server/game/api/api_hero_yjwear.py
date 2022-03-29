#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄 - 一键穿戴装备
'''

def proc(conn, data):
    """

    :param conn:
    :param data: ['5d2db17c0ae9fe3a60067ac2'英雄tid]
    :return:
    ::

        {'d': {'hero'英雄属性: {'5d2db17c0ae9fe3a60067ac2': {u'atk': 7807,
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
                                                     u'hp': 62738,
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
                                                     'weardata': {'1': u'1001',
                                                                  '3': u'3011'},
                                                     'zhanli': 17492}}},
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

    _preData = g.m.herofun.getUserwearInfo(uid, tid,strict=True)
    if _preData == False: 
        #英雄不存在时，不应该往下走，否则装备数据会出错
        _res = {"s": -1,"errmsg":g.L('hero_not_exist')}
        return _res
    
    if not _preData: _preData = {}
    _wearData = g.m.equipfun.getBestByWearData(uid, tid, _preData, True)
    _send = g.m.herofun.reSetHeroBuff(uid, tid)
    _send[tid]['weardata'] = _wearData['weardata']
    _sendData = {'hero':_send,'shipin':_wearData['shipin'],'equip':_wearData['equip']}
    g.sendChangeInfo(conn, _sendData)
    g.event.emit('JJCzhanli', uid, tid)
    _res['d'] = {'hero':_send}

    # 检查装备使用数量
    for i in _wearData['return']:
        g.m.equipfun.chkEquipUsenum(uid, i, 4)
    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['5d2db17c0ae9fe3a60067ac2']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
