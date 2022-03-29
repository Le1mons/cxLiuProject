#!/usr/bin/python
# coding:utf-8
'''
劳动节活动 - 挑战boss
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

from ZBFight import ZBFight
def proc(conn, data):
    """

        :param conn:
        :param 参数1: 扫荡 	类型: <type 'bool'>	说明: 是否扫荡
        :param 参数2: 战斗阵容 	类型: <type 'dict'>	说明: 战斗阵容
        :return:
        ::

        {'d': {'info': {u'data': {},
                    u'etime': 1620748800,
                    u'hdid': 7302,
                    u'rtime': 1620748800,
                    u'stime': 1618156800},
           'myinfo': {'date': '2021-04-16',
                      'duihuan': {},  兑换
                      'extrec': [],  额外抽奖奖励
                      'fightnum': 0,  战斗次数
                      'libao': {},   礼包购买
                      'lottery': {},  抽奖数据
                      'task': {'data': {}, 'rec': []}, 任务data进度， rec领奖id
                      'topdps': 0}},   最高伤害
        's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(73, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    _saodang = bool(data[0])
    _fightData = {}
    if len(data) > 1:
        _fightData = data[1]
    _con = g.m.labourfun.getCon()
    _data = g.m.labourfun.getData(uid, _hd['hdid'])
    _num = 1
    # 如果是扫荡判断之前是否挑战过
    if _saodang:
        if _data["topdps"] <= 0:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
            return _chkData
        if _data["fightnum"] >= _con["freenum"]:  # 没有免费次数才需要判断消耗
            _need = _con['fightneed']
            _item = g.mdb.find1('itemlist', {'uid': uid, 'itemid': str(_need[0]["t"])}) or {}
            _num = _item.get('num', 0)
            if _num == 0:
                if _need['a'] == 'attr':
                    _chkData['s'] = -100
                    _chkData['attr'] = _need['t']
                else:
                    _chkData["s"] = -104
                    _chkData[_need['a']] = _need['t']
                return _chkData
            if _num > 10: _num = 10
        else:
            _num = 0

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    # 判断是否免费
    if _data["fightnum"] >= _con["freenum"]:

        # 判断消耗
        _need = _con['fightneed']
        _need = [{"a": i["a"], "t": i["t"], "n": i["n"] * _num} for i in _need]
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _chkData['s'] = -100
                _chkData['attr'] = _chk['t']
            else:
                _chkData["s"] = -104
                _chkData[_chk['a']] = _chk['t']
            return _chkData
    else:
        _num = 0

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["num"] = _num
    _chkData["chkfight"] = _chkFightData
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _saodang = bool(data[0])

    _data = _chkData['data']
    _chkFightData = _chkData["chkfight"]
    _con = g.m.labourfun.getCon()
    _bossList = _con["mowang"]["boss"]

    _num = _chkData['num']
    if _saodang:
        _fightRes = {}
    else:
        _fightData = data[1]
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
        f = ZBFight('pve')

        _fightRes = f.initFightByData(_userFightData + list(_bossList)).start()

        _fightRes['headdata'] = [_chkFightData['headdata'], _con["mowang"]["headdata"]]
    # 删除道具
    # 消耗最多一次直接扫荡10次
    if _num:  # 不是免费才需要判断消耗
        _need = _con['fightneed']
        _need = [{"a": i["a"], "t": i["t"], "n": i["n"] * _num} for i in _need]
        _send = g.delNeed(uid, _need, 0, {'act': 'labourhd_fightboss'})
        g.sendChangeInfo(conn, _send)
    _resData = {}
    _resData['fightres'] = _fightRes


    _data["fightnum"] += _num if _num else 1  # 免费的也要加次数
    _setData = {}
    _setData["fightnum"] = _data["fightnum"]
    if not _saodang and _fightRes['dpsbyside'][0] > _data["topdps"]:
        _data["topdps"] = _fightRes['dpsbyside'][0]

        _setData["topdps"] = _data["topdps"]

    _resData["myinfo"] = _data
    # 设置任务领奖
    g.m.labourfun.setData(uid, _chkData['hdid'],_setData)

    _prize, _dlzprize = [], []
    _prizecishu = _num
    if _num == 0: _prizecishu = 1
    for i in xrange(0, _prizecishu):
        for dlz in _con["dps2dlz"]:
            if dlz[0] > _data["topdps"]:
                break
            _prize += dlz[1]["prize"]
            if 'dlz' in dlz[1]:
                _temp = g.m.diaoluofun.getGroupPrize(dlz[1]['dlz'])
                _prize += _temp
                _dlzprize += _temp

    # _prize += g.m.diaoluofun.getGroupPrize(_con['fightdlz'])  # _con['fightdlz']是None,返回空列表,屏蔽
    _prize = g.mergePrize(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act': 'labourhd_fightboss'})
    g.sendChangeInfo(conn, _send)
    _resData["prize"] = _prize
    _resData["dlzprize"] = _dlzprize


    _res['d'] = _resData

    return _res

if __name__ == '__main__':
    # uid = g.buid("0")
    uid = "0_5ea2b6359dc6d633c953dd72"
    g.debugConn.uid = uid
    # data = [True, {"1":"5ff482bc9dc6d62dff47075c","2":"5ff482bb9dc6d62dff4706cf","3":"5ff482bb9dc6d62dff470726","4":"5ff482ba9dc6d62dff47069c","5":"5ff482bb9dc6d62dff4706fe","6":"5ff482bb9dc6d62dff4706b2","sqid":3}]
    data = [True]
    print doproc(g.debugConn, data=data)
