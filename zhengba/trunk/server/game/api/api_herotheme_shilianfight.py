#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 试炼战斗
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(80,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    # 关卡下标

    _id = str(data[0])
    _fightData = data[1]

    _con = g.m.herothemefun.getCon()
    _shilian = _con["shilian"][_id]

    # # 判断今天是否有挑战次数
    _data = g.m.herothemefun.getData(uid, _hd['hdid'], keys='shilian,jifen,val,task')
    if _id != "1" and str(int(_id) - 1) not in _data["shilian"]["win"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-3')
        return _chkData


    # # 判断今天是否有挑战次数
    _data = g.m.herothemefun.getData(uid, _hd['hdid'], keys='shilian,jifen,val,task')
    # 判断是否可以挑战
    if _id in _data["shilian"]["win"] and _id in ("1", "2", "3", "4"):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-3')
        return _chkData


    # 战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    if _data["shilian"]["fightnum"] <= 0:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-4')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData["chkfightdata"] = _chkFightData

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData


    # 关卡下标
    _id = str(data[0])
    _fightData = data[1]

    _con = g.m.herothemefun.getCon()
    _hdid = _chkData['hdid']
    _data = _chkData["data"]
    _chkFightData = _chkData["chkfightdata"]


    _shilianCon = _con["shilian"][_id]
    # 加上星级加成
    _herostarpro = _con["herostarpro"]
    # 加上积分加成
    _jifenPro = 0
    _buffPro = 0
    if str(_data["val"]) in _herostarpro:
        _jifenPro = _herostarpro[str(_data["val"])]["jifen"]
        _buffPro = _herostarpro[str(_data["val"])]["buff"]
        _chkFightData['herolist'] = g.m.herothemefun.addBuff(uid, _chkFightData['herolist'], {"atkpro": _buffPro, "hppro":_buffPro})
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))


    # 判断是打boss还是小怪
    if _id != "5":
        # boss战斗信息
        _bossFightData = g.m.fightfun.getNpcFightData(_shilianCon["npcid"])
        f = ZBFight('pve')
    else:
        f = ZBFight('pvm')
        f.maxTurn = 10
        _bossFightData = {"herolist":list(_con['boss']['boss']), "headdata":_con['boss']['headdata']}

    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    _winside = _fightRes['winside']
    _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _bossFightData['headdata']]
    _resData = {}
    _resData['fightres'] = _fightRes
    _resData["addjifen"] = 0
    # 判断是否胜利
    _prize = []
    if _winside == 0:
        # 设置数据
        g.m.herothemefun.setData(uid, _chkData['hdid'], {"shilian": _data["shilian"]})
        # 如果曾经没通关
        if _id not in _data["shilian"]["win"]:
            _data["shilian"]["win"].append(_id)
            _prize.extend(_shilianCon["prize"])
            _resData["addjifen"] += _shilianCon["jifen"]


    # 如果是boss
    if _id == "5":
        if _id not in _data["shilian"]["win"]:
            _data["shilian"]["win"].append(_id)
            _prize.extend(_shilianCon["prize"])
            _resData["addjifen"] += _shilianCon["jifen"]
        else:
            _prize.extend(_shilianCon["fightprize"])
            _data["shilian"]["fightnum"] -= 1

        _addJiFen = 0
        for ele in _con["dpsjifen"]:
            if ele["area"][1] >= _fightRes["dpsbyside"][0] >= ele["area"][0]:
                _addJiFen = ele["jifen"]

        # _lessTurn = f.maxTurn + 1 - f.turn
        # _addJiFen += _lessTurn * _con["turnjifen"]
        _addJiFen = int(_addJiFen * (1000 + _jifenPro) / 1000)
        _resData["addjifen"] += _addJiFen

    _data["jifen"] += _resData["addjifen"]
    _data["task"]["data"]["3"] = _data["task"]["data"].get("3", 0) + 1

    g.m.herothemefun.setData(uid, _chkData['hdid'], {"shilian": _data["shilian"], "jifen":_data["jifen"]})

    _groupId = g.m.crosscomfun.getServerGroupId(uid)
    _ctype = "herotheme_jifen"
    if _data["jifen"] > 0:
        _crossRes = g.m.crosscomfun.CATTR().setAttr(uid, {'ctype': _ctype}, {"sid": g.getHostSid(), "v":_data["jifen"], "k": _groupId, "hdid":_hdid})

    if _prize:
        _sendData = g.getPrizeRes(uid, _prize, {'act': 'herotheme_shilianfight', 'id': _id})
        g.sendChangeInfo(conn, _sendData)

    g.event.emit('herotheme', uid, "3")

    _resData["prize"] = _prize
    _resData["myinfo"] = _data
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    doproc(g.debugConn, data=[5, {"1": "611bdba25bff5b0c08971971", "2": "601fcb8f9dc6d67113757c1d",
                                  "3": "601fcb8f9dc6d67113757c67", "4": "611bdba15bff5b0c08971919",
                                  "5": "601fcb909dc6d67113757ca3", "6": "611bdba45bff5b0c089719b7"}])