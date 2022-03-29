#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight

'''
炼魂塔-挑战
'''

def proc(conn, data, key=None):
    """
    炼魂塔-挑战
    :param conn:
    :param data: [layerid, fightdata, borrowuid]  小关卡的id, 战斗阵容, 租借的英雄的uid， {“pos”:uid} 位置和uid没有就传{}
    :param key:
    :return:
    ::
        {'d': {'myinfo': {u'allstar': 0,
                  u'borrowuid': [],
                  u'layerstar': {},
                  u'pool': {},
                  u'rec': [],
                  u'selectprize': {}}},
        's': 1}



    """


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _id = str(data[0])
    _fightData = data[1]
    _borrowuid = data[2]

    # 获取自己的数据
    _myInfo = g.m.lianhuntafun.getData(uid)

    _sqid = None
    # 如果神器存在
    if "sqid" in _fightData:
        _sqid = _fightData["sqid"]
        del _fightData["sqid"]

    herolist = _fightData.values()
    if not herolist:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('lianhunta_fight_res_-1')
        return _chkData
    _posInfo = {tid:pos for pos, tid in _fightData.items()}
    # 检查战斗参数
    _heroinfo = g.mdb.find("hero", {"uid":uid, "_id":{"$in": map(g.mdb.toObjectId, _fightData.values())}})
    _chkHeroInfo = {}
    for hero in _heroinfo:
        _pos = _posInfo[str(hero["_id"])]
        hero['pos'] = _pos
        _chkHeroInfo[_pos] = hero

    _con = g.GC["lianhuntacom"]

    _heroinfo = sorted(_chkHeroInfo.items(), key=lambda item: int(item[0]))
    _heroinfo = [hero[1] for hero in _heroinfo]
    if len(_heroinfo) != len(_fightData):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData
    # 如果有租借的英雄
    if _borrowuid:
        _toUid = _borrowuid.values()[0]
        _data = g.CROSSATTR.getAttrOne(_toUid, {"ctype":"lianhunta_borrowhero"})
        if not _data:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData
        # 判断是否超过赛季次数
        if len(_myInfo["borrowuid"]) >= _con["borrownum"]:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('global_numerr')
            return _chkData


        _chkData["borrowhero"] = _data["v"]
    _chkData["heroinfo"] = _heroinfo
    _chkData["myinfo"] = _myInfo
    _chkData["sqid"] = _sqid
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

    _id = str(data[0])
    _fightData = data[1]
    _borrowuid = data[2]

    _heroinfo = _chkData["heroinfo"]
    _myInfo = _chkData["myinfo"]
    _sqid = _chkData["sqid"]
    # 获取关卡的战斗数据
    _layerInfo = g.m.lianhuntafun.getLayerInfo(uid)[_id]

    _setData = {}

    # 玩家战斗信息
    _userFightData = g.m.lianhuntafun.fmtHeroList(uid, _heroinfo, _sqid)["herolist"]
    if _borrowuid:
        # 处理站位冲突
        _borrpos = int(_borrowuid.keys()[0])
        # 如果借来的英雄站位在自己的之中, 自己的英雄站位都往后挪一位
        # if len(_userFightData) >= _borrpos:  # 换种处理方式
        #     for _hero in _userFightData[_borrpos-1:]:
        #         _hero['pos'] += 1
        _extFightData = _chkData["borrowhero"][0]
        _extFightData["pos"] = _borrpos
        _userFightData.append(_extFightData)


    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _layerInfo["herolist"]).start()
    _con = g.GC["lianhunta"][_id]
    bossHead = {}
    _bossCon = g.m.herofun.getHeroCon(_layerInfo["herolist"][-1]['hid'])
    bossHead['name'] = _con['bossname']
    bossHead['lv'] = _layerInfo["herolist"][-1]['lv']
    bossHead['head'] = _bossCon['heroico']

    _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), bossHead]

    _winside = _fightRes["winside"]
    # 如果胜利了
    _prize = []
    _resData["fightres"] = _fightRes

    if _winside == 0:

        _starcond = _layerInfo["starcond"]
        _star = g.m.lianhuntafun.chkStar(_heroinfo, _starcond, f.turn, _fightRes)

        if _borrowuid:
            # 加入租借好友的数据
            _myInfo["borrowuid"].append(_borrowuid.values()[0])
            _setData["borrowuid"] = _myInfo["borrowuid"]
            _star = [1]

        _oldStar = _myInfo["layerstar"].get(_id, [])
        _prize = []
        for i in _star:
            # 判断奖励是否领过
            if i in _oldStar:
                continue
            _prize += list(_con["prizeinfo"][str(i)])

        _myInfo["layerstar"][_id] = list(set(_myInfo["layerstar"].get(_id, []) + _star))

        _setData["layerstar"] = _myInfo["layerstar"]

        _setData["allstar"] = _myInfo["allstar"] = sum([len(i) for i in _myInfo["layerstar"].values()])

        g.m.lianhuntafun.setData(uid, _setData)
        _sendData = g.getPrizeRes(uid, _prize, {'act': 'lianhunta_fight', "id": _id})
        g.sendChangeInfo(conn, _sendData)

        _resData['prize'] = _prize
        _resData["star"] = _star

    _resData["myinfo"] = _myInfo

    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('0')
    print g.debugConn.uid
    _data = ["2",{"2":"5d03dd53a31eba7a971770b0"},{"1": "9250_5c85a6cca31eba3d53ac4243"}]
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))
    print set([] + [1,2])
