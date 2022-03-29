#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-boss挑战
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
from ZBFight import ZBFight
def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [herodata:dict] 上阵英雄
    :param key:
    :return:
            {'d': {'boss': {'buyinfo': {}, 'jifen': 40, 'num': 2, 'reclist': []},
               'fightres': {'dpsbyside': [28500, 0],
                            'fightlog': [{'act': 'turn', 'v': 1},
                                         {'act': 'atk',
                                          'atkType': 'petAtk',
                                          'from': 'pet_0',
                                          'skillid': '300300002',
                                          'to': {'role_1': {'act': 'hp',
                                                            'at': 'petAtk',
                                                            'dps': -28500,
                                                            'nv': -1061,
                                                            'r': 'role_1',
                                                            'skillid': '300300002',
                                                            'v': -28500}}},
                                         {'act': 'dead',
                                          'canFuHuo': False,
                                          'to': 'role_1'},
                                         {'act': 'fightres', 'v': 0}],
                            'fightres': {'pet_0': {'atk': 1425,
                                                   'dead': False,
                                                   'hp': 57000,
                                                   'pid': u'3003',
                                                   'pos': 1,
                                                   'qusan': 0,
                                                   'rid': 'pet_0',
                                                   'side': 0,
                                                   'skill': '300300002',
                                                   'speed': 6},
                                         'role_0': {'afterXpskillRound': 1,
                                                    'atk': 853,
                                                    'atkpro': 1000,
                                                    'baojipro': 0,
                                                    'baoshangpro': 0,
                                                    'bd1skill': ('41023111',),
                                                    'bd2skill': (),
                                                    'bd3skill': (),
                                                    'curepro': 0,
                                                    'dead': False,
                                                    'def': 172,
                                                    'defpro': 1000,
                                                    'dpspro': 0,
                                                    'gedangpro': 0,
                                                    'hid': u'41023',
                                                    'hp': 30409,
                                                    'hppro': 1000,
                                                    'isBack': True,
                                                    'isFront': True,
                                                    'jianshangpro': 0,
                                                    'jingzhunpro': 0,
                                                    'job': 1,
                                                    'lv': 50,
                                                    'maxhp': 30409,
                                                    'maxnuqi': 100,
                                                    'miankongpro': 0,
                                                    'normalskill': '41023002',
                                                    'nuqi': 50,
                                                    'pojiapro': 0,
                                                    'pos': 1,
                                                    'pvpdpspro': 0,
                                                    'pvpundpspro': 0,
                                                    'ready': True,
                                                    'rid': 'role_0',
                                                    'shenqidpspro': 0,
                                                    'side': 0,
                                                    'skill': [],
                                                    'skilldpspro': 0,
                                                    'speed': 224,
                                                    'speedpro': 1000,
                                                    'star': 1,
                                                    'unbaojipro': 0,
                                                    'undercurepro': 0,
                                                    'undotdpspro': 0,
                                                    'undpspro': 0,
                                                    'unliuxuepro': 0,
                                                    'unzhongdupro': 0,
                                                    'unzhuoshaopro': 0,
                                                    'xpskill': '41023012',
                                                    'zhongdudpsdrop': 0,
                                                    'zhongdudpspro': 0,
                                                    'zhongzu': 4},
                                         'role_1': {'atk': 6317,
                                                    'atkpro': 1000,
                                                    'baojipro': 0,
                                                    'baoshangpro': 0,
                                                    'bd1skill': ('63015111',
                                                                 '63015121'),
                                                    'bd2skill': ('63015211',),
                                                    'bd3skill': (),
                                                    'curepro': 0,
                                                    'dead': True,
                                                    'def': 919,
                                                    'defpro': 1000,
                                                    'dpspro': 0,
                                                    'enlargepro': 1,
                                                    'gedangpro': 0,
                                                    'head': '63015',
                                                    'hid': '63015',
                                                    'hp': -1061,
                                                    'hppro': 1000,
                                                    'isBack': True,
                                                    'isFront': True,
                                                    'jianshangpro': 0,
                                                    'jingzhunpro': 0,
                                                    'job': 3,
                                                    'lv': 155,
                                                    'maxhp': 27439,
                                                    'maxnuqi': 100,
                                                    'miankongpro': 0,
                                                    'normalskill': '63015002',
                                                    'nuqi': 50,
                                                    'pojiapro': 0,
                                                    'pos': 4,
                                                    'pvpdpspro': 0,
                                                    'pvpundpspro': 0,
                                                    'ready': True,
                                                    'rid': 'role_1',
                                                    'shenqidpspro': 0,
                                                    'side': 1,
                                                    'skill': ['63015111',
                                                              '63015121',
                                                              '63015211'],
                                                    'skilldpspro': 0,
                                                    'speed': 776,
                                                    'speedpro': 1000,
                                                    'star': 6,
                                                    'unbaojipro': 0,
                                                    'undercurepro': 0,
                                                    'undotdpspro': 0,
                                                    'undpspro': 0,
                                                    'unliuxuepro': 0,
                                                    'unzhongdupro': 0,
                                                    'unzhuoshaopro': 0,
                                                    'xpskill': '63015012',
                                                    'zhanli': 11243,
                                                    'zhongdudpsdrop': 0,
                                                    'zhongdudpspro': 0,
                                                    'zhongzu': 5}},
                            'headdata': [{'chatborder': '1',
                                          'ext_servername': u'07',
                                          'ghid': '',
                                          'ghname': '',
                                          'ghpower': -1,
                                          'head': '41023',
                                          'headborder': '1',
                                          'lasttime': 1586731275,
                                          'logintime': 1586726583,
                                          'lv': 300,
                                          'model': u'31012',
                                          'name': u'temp_93f23bea',
                                          'sid': 0,
                                          'uid': u'0_5e87440b9dc6d66e10ba6355',
                                          'uuid': u'02215125',
                                          'vip': 7,
                                          'wzyj': 0,
                                          'zhanli': 1972},
                                         {'head': '63015',
                                          'lv': 155,
                                          'name': '\xe7\xa5\x9e\xc2\xb7\xe7\x9a\x87\xe7\x94\xab\xe5\xb5\xa9'}],
                            'roles': {'pet_0': {'atk': 1425,
                                                'dead': False,
                                                'hp': 57000,
                                                'pid': u'3003',
                                                'pos': 1,
                                                'qusan': 0,
                                                'rid': 'pet_0',
                                                'side': 0,
                                                'skill': '300300002',
                                                'speed': 6},
                                      'role_0': {'atk': 853,
                                                 'atkpro': 1000,
                                                 'baojipro': 0,
                                                 'baoshangpro': 0,
                                                 'bd1skill': ('41023111',),
                                                 'bd2skill': (),
                                                 'bd3skill': (),
                                                 'curepro': 0,
                                                 'dead': False,
                                                 'def': 172,
                                                 'defpro': 1000,
                                                 'dpspro': 0,
                                                 'gedangpro': 0,
                                                 'hid': u'41023',
                                                 'hp': 30409,
                                                 'hppro': 1000,
                                                 'isBack': True,
                                                 'isFront': True,
                                                 'jianshangpro': 0,
                                                 'jingzhunpro': 0,
                                                 'job': 1,
                                                 'lv': 50,
                                                 'maxhp': 30409,
                                                 'maxnuqi': 100,
                                                 'miankongpro': 0,
                                                 'normalskill': '41023002',
                                                 'nuqi': 50,
                                                 'pojiapro': 0,
                                                 'pos': 1,
                                                 'pvpdpspro': 0,
                                                 'pvpundpspro': 0,
                                                 'ready': True,
                                                 'rid': 'role_0',
                                                 'shenqidpspro': 0,
                                                 'side': 0,
                                                 'skill': [],
                                                 'skilldpspro': 0,
                                                 'speed': 224,
                                                 'speedpro': 1000,
                                                 'star': 1,
                                                 'unbaojipro': 0,
                                                 'undercurepro': 0,
                                                 'undotdpspro': 0,
                                                 'undpspro': 0,
                                                 'unliuxuepro': 0,
                                                 'unzhongdupro': 0,
                                                 'unzhuoshaopro': 0,
                                                 'xpskill': '41023012',
                                                 'zhongdudpsdrop': 0,
                                                 'zhongdudpspro': 0,
                                                 'zhongzu': 4},
                                      'role_1': {'atk': 6317,
                                                 'atkpro': 1000,
                                                 'baojipro': 0,
                                                 'baoshangpro': 0,
                                                 'bd1skill': ('63015111',
                                                              '63015121'),
                                                 'bd2skill': ('63015211',),
                                                 'bd3skill': (),
                                                 'curepro': 0,
                                                 'dead': False,
                                                 'def': 919,
                                                 'defpro': 1000,
                                                 'dpspro': 0,
                                                 'enlargepro': 1,
                                                 'gedangpro': 0,
                                                 'head': '63015',
                                                 'hid': '63015',
                                                 'hp': 27439,
                                                 'hppro': 1000,
                                                 'isBack': True,
                                                 'isFront': True,
                                                 'jianshangpro': 0,
                                                 'jingzhunpro': 0,
                                                 'job': 3,
                                                 'lv': 155,
                                                 'maxhp': 27439,
                                                 'maxnuqi': 100,
                                                 'miankongpro': 0,
                                                 'normalskill': '63015002',
                                                 'nuqi': 50,
                                                 'pojiapro': 0,
                                                 'pos': 4,
                                                 'pvpdpspro': 0,
                                                 'pvpundpspro': 0,
                                                 'ready': True,
                                                 'rid': 'role_1',
                                                 'shenqidpspro': 0,
                                                 'side': 1,
                                                 'skill': ['63015111',
                                                           '63015121',
                                                           '63015211'],
                                                 'skilldpspro': 0,
                                                 'speed': 776,
                                                 'speedpro': 1000,
                                                 'star': 6,
                                                 'unbaojipro': 0,
                                                 'undercurepro': 0,
                                                 'undotdpspro': 0,
                                                 'undpspro': 0,
                                                 'unliuxuepro': 0,
                                                 'unzhongdupro': 0,
                                                 'unzhuoshaopro': 0,
                                                 'xpskill': '63015012',
                                                 'zhanli': 11243,
                                                 'zhongdudpsdrop': 0,
                                                 'zhongdudpspro': 0,
                                                 'zhongzu': 5}},
                            'signdata': {'role_0': {'addhp': 0, 'dps': 0},
                                         'role_1': {'addhp': 0, 'dps': 0}},
                            'winside': 0,
                            'zhenfa': [{}, {}]},
               'prize': [{u'a': u'attr', u'n': 50, u't': u'jinbi'}]},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    # 英雄的站位信息
    _fightData = data[0]

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    _con = _hdinfo["data"]["openinfo"]["boss"]
    _info = g.m.wangzhezhaomufun.getBossInfo(uid, _hdinfo)
    # 挑战次数不足
    if _info["num"] >= _con["val"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('wangzhezhaomu_fightboss_res_-3')
        return _chkData

        # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    _chkData["hdinfo"] = _hdinfo
    _chkData["info"] = _info
    _chkData["chkfightdata"] = _chkFightData
    _chkData["fightdata"] = _fightData
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _resData = {}
    _hdinfo = _chkData["hdinfo"]
    _info = _chkData["info"]
    _chkFightData = _chkData["chkfightdata"]
    _fightData = _chkData["fightdata"]

    _con = _hdinfo["data"]["openinfo"]["boss"]

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = _info["bossdata"]

    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData).start()

    _bosHead = {'head': _bossFightData[0]["heroico"], 'lv': _bossFightData[0]["lv"], 'name':_bossFightData[0]["name"]}
    _fightRes['headdata'] = [_chkFightData['headdata'], _bosHead]
    _winside = _fightRes['winside']
    _prize = []
    _addJiFen = 0
    for ele in _con["dpsprize"]:
        _prize = ele["prize"]
        _addJiFen = ele["addjifen"]
        if ele["val"] > _fightRes["dpsbyside"][0]:
            break

    _info["jifen"] += _addJiFen
    _info["num"] += 1
    _resData["fightres"] = _fightRes

    # 设置活动数据
    _setData = {}
    _setData["v"] = _info["num"]
    _setData["jifen"] = _info["jifen"]
    g.m.wangzhezhaomufun.setBossInfo(uid, _hdinfo, _setData)

    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_fightboss',  "prize": _prize, "hdid": _hdinfo["hdid"]})
    g.sendChangeInfo(conn, _sendData)
    _resData['boss'] = _info
    _resData["prize"] = _prize

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    data = [{"1":"5e87440b9dc6d66e10ba6368"}]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'