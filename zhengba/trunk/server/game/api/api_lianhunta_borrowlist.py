#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
炼魂塔-租借列表
'''

def proc(conn, data, key=None):
    """
    炼魂塔-租借列表
    :param conn:
    :param data:
    :param key:
    :return:
    ::
        {'d': {'list': [{u'name': u'\u53f6\u53f6\u53f6',
                 u'uid': u'0_5d8c34029dc6d663681e3a1c',
                 u'v': {u'atk': 58969,
                        u'atkdrop': 0,
                        u'atkpro': 1661,
                        u'baojidrop': 0,
                        u'baojipro': 0,
                        u'baoshangdrop': 0,
                        u'baoshangpro': 0,
                        u'bd1skill': [u'5302a101',
                                      u'5302a111',
                                      u'5302a121',
                                      u'5302a404'],
                        u'bd2skill': [u'5302a204'],
                        u'bd3skill': [u'5302a304'],
                        u'bdskillopendjlv': [2, 4, 6],
                        u'controlpro': 300,
                        u'ctime': 1612710681,
                        u'def': 744,
                        u'defdrop': 0,
                        u'defpro': 1000,
                        u'dengjie': 6,
                        u'dengjielv': 10,
                        u'dpsdrop': 0,
                        u'dpspro': 110,
                        u'extbuff': {u'chenghao': [],
                                     u'meltsoul': [{u'atk': 100}],
                                     u'wuhun': {}},
                        u'fkdpspro': 0,
                        u'gedangdrop': 0,
                        u'gedangpro': 0,
                        u'growid': u'53026',
                        u'herobuff': {u'baoshi': [],
                                      u'bdskillbuff': [{u'hppro': 200},
                                                       {u'atkpro': 250},
                                                       {u'undpspro': 250}],
                                      u'equip': [{u'atk': 4875,
                                                  u'dpspro': 50},
                                                 {u'hp': 42195,
                                                  u'hppro': 20},
                                                 {u'atk': 3250,
                                                  u'dpspro': 50},
                                                 {u'atk': 650,
                                                  u'dpspro': 10},
                                                 {u'hp': 68303,
                                                  u'undpspro': 24},
                                                 {u'hp': 13660,
                                                  u'undpspro': 5},
                                                 {u'hppro': 185},
                                                 {u'atkpro': 225},
                                                 {u'hppro': 100}],
                                      u'glyph': [],
                                      u'shipin': [{u'controlpro': 300,
                                                   u'hppro': 250,
                                                   u'speed': 50}]},
                        u'hid': u'53026',
                        u'hp': 1865296,
                        u'hpdrop': 0,
                        u'hppro': 2445,
                        u'islock': 0,
                        u'jianshangpro': 0,
                        u'jiban': u'',
                        u'jingzhundrop': 0,
                        u'jingzhunpro': 0,
                        u'job': 3,
                        u'lasttime': 1612710681,
                        u'lv': 109,
                        u'meltsoul': 1,
                        u'miankongdrop': 0,
                        u'miankongpro': 0,
                        u'name': u'\u6697\u5f71\u9b42\u7267',
                        u'normalskill': u'53026002',
                        u'pinglunid': u'5302',
                        u'pojiadrop': 0,
                        u'pojiapro': 0,
                        u'pvpdpspro': 250,
                        u'pvpundpspro': 250,
                        u'skilldpsdrop': 0,
                        u'skilldpspro': 0,
                        u'speed': 726,
                        u'speeddrop': 0,
                        u'speedpro': 1000,
                        u'star': 10,
                        u'staratkpro': 1000,
                        u'starhppro': 1000,
                        u'uid': u'0_5d8c34029dc6d663681e3a1c',
                        u'unbaojipro': 0,
                        u'undercurepro': 0,
                        u'undotdpspro': 0,
                        u'undpsdrop': 0,
                        u'undpspro': 279,
                        u'weardata': {u'1': u'105601',
                                      u'2': u'205603',
                                      u'3': u'305602',
                                      u'4': u'405603',
                                      u'5': u'6576'},
                        u'xpskill': u'5302a012',
                        u'zhanli': 503721,
                        u'zhongzu': 5}}]},
        's': 1}




    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

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
        # 奖励的下标

    _myInfo = g.m.lianhuntafun.getData(uid)

    _uidList = g.m.lianhuntafun.getBorrowUserList(uid, _myInfo["borrowuid"])

    _resData = {}
    _resData["list"] = []
    # 获取派遣列表
    # 如果有自己就过滤掉
    if uid in _uidList:
        _uidList.remove(uid)

    _borrowList = g.crossDB.find("crossplayattr", {"ctype": "lianhunta_borrowhero", "uid": {"$in": _uidList}}, fields=["v", "uid", "name", "_id"])
    for info in _borrowList:
        _resData["list"].append(info)

    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('lsq0')
    print g.debugConn.uid
    _data = ['0', "0"]
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))