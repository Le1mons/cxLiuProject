#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
炼魂塔-open
'''

def proc(conn, data, key=None):
    """

    :param conn:
    :param data: [关卡id]
    :param key:
    :return:
    ::
        {'d': {'1': {u'herolist': [{u'djlv': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'sqid': u'6'},
                           {u'atk': 917,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 216,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 11306,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 35,
                            u'maxhp': 1245,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 1,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 194,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1},
                           {u'atk': 822,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 50,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 10348,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 1,
                            u'maxhp': 287,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 2,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 126,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1},
                           {u'atk': 822,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 50,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 10348,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 1,
                            u'maxhp': 287,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 3,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 126,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1},
                           {u'atk': 822,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 50,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 10348,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 1,
                            u'maxhp': 287,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 4,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 126,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1},
                           {u'atk': 822,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 50,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 10348,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 1,
                            u'maxhp': 287,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 5,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 126,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1},
                           {u'atk': 822,
                            u'atkpro': 1000,
                            u'baojipro': 0,
                            u'baoshangpro': 0,
                            u'bd1skill': [],
                            u'bd2skill': [],
                            u'bd3skill': [],
                            u'controlpro': 0,
                            u'def': 50,
                            u'defpro': 1000,
                            u'dengjielv': 0,
                            u'dpspro': 0,
                            u'gedangpro': 0,
                            u'hid': u'11011',
                            u'hp': 10348,
                            u'hppro': 1000,
                            u'jianshangpro': 0,
                            u'jingzhunpro': 0,
                            u'job': 1,
                            u'lv': 1,
                            u'maxhp': 287,
                            u'maxnuqi': 100,
                            u'miankongpro': 0,
                            u'normalskill': u'1',
                            u'nuqi': 50,
                            u'pojiapro': 0,
                            u'pos': 6,
                            u'pvpdpspro': 0,
                            u'pvpundpspro': 0,
                            u'shenqidpspro': 0,
                            u'side': 1,
                            u'skill': [],
                            u'skilldpspro': 0,
                            u'skin': {},
                            u'speed': 126,
                            u'speedpro': 1000,
                            u'star': 0,
                            u'unbaojipro': 0,
                            u'undotdpspro': 0,
                            u'undpspro': 0,
                            u'xpskill': u'11011012',
                            u'zhongdudpsdrop': 0,
                            u'zhongdudpspro': 0,
                            u'zhongzu': 1}],
             u'maxzhanli': 9093,
             'starcond': {u'1': {},
                          u'2': {u'cond': [u'1'],
                                 u'key': u'zhongzu',
                                 u'num': 1,
                                 u'random': [u'1']},
                          u'3': {u'cond': [u'1'],
                                 u'key': u'nojob',
                                 u'random': [u'1']}}}},
            's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _gkid = str(data[0])
    # 获取公平竞技场是否开启
    _chkOpen = g.m.lianhuntafun.checkOpen(uid, _gkid)
    if not _chkOpen:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _gkid = str(data[0])
    _con = g.GC["lianhuntacom"]["guanka"][_gkid]
    _layerList = _con["layerinfo"]
    _layerInfo = g.m.lianhuntafun.getLayerInfo(uid)
    _resData = {}
    for id in _layerList:
        _resData[id] = _layerInfo.get(id, [])


    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('jingqi_2107191049578368')
    print g.debugConn.uid
    _data = ['1']
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))