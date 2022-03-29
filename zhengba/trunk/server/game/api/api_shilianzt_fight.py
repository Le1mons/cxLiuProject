#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g,random
from ZBFight import ZBFight
'''
试炼之塔 - 挑战boss或镜像
'''
def proc(conn, data,key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _act = str(data[0])

    _fightData = data[1]

    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = dict(g.GC["shilianztcom"])
    _data = g.m.shilianztfun.getData(uid)
    # 判断如果是打boss
    if _act == "1":
        # 判断是否通关
        if _data["killboss"]:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('hilianzt_res_-3')
            return _chkData
    else:
        # 判断是否有镜灵
        if not _data["mirror"]:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_noopen')
            return _chkData

        # 判断镜灵是否挑战成功
        if _data["killmirror"]:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('hilianzt_res_-3')
            return _chkData

    _nt = g.C.NOW()
    # 当前赛季已经结束
    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    _chkData["chkfightdata"] = _chkFightData
    _chkData["fightdata"] = _fightData
    _chkData["data"] = _data
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _act = str(data[0])
    _chkFightData = _chkData["chkfightdata"]
    _fightData = _chkData["fightdata"]
    _data = _chkData["data"]

    _setData = {}
    _resData = {}
    _con = dict(g.GC["shilianztcom"])

    _layerCon = g.m.shilianztfun.getCon(_data["layer"])

    _npcid = _layerCon["boss"]

    _chkFightData['herolist'] = g.m.shilianztfun.addBuff(uid, _chkFightData['herolist'], _data)
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # 添加获得的buff

    if _act == "1":
        # boss战斗信息
        _bossFightData = g.m.fightfun.getNpcFightData(_npcid)
        # 如果每轮挑战超过30次就boss会增加一个额外系数
        if _data["layernum"] >= 30:
            _extPro = 1 + (_data["layer"] - 30) / 60
            for hero in _bossFightData["herolist"]:
                hero["hp"] = int(hero["hp"] * _extPro)
                hero["atk"] = int(hero["atk"] * _extPro)
                hero["maxhp"] = hero["hp"]

    else:
        _bossFightData = _data["mirror"]


    f = ZBFight('pve')
    _preUserFightData = g.C.dcopy(_userFightData)
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    _winside = _fightRes['winside']
    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
    _resData['fightres'] = _fightRes
    # 赢了就加入完成事件
    if _winside == 0:
        if _act == "1":
            _prize = _layerCon["prize"]
            _setData["killboss"] = _data["killboss"] = 1
            _data["mirrornum"] += 1
            # 判断本次是否生成镜灵
            if random.randint(1, 1000) <= _con["mirrorpro"][str(_data["mirrornum"])]:
                # 生成镜像数据 * 对应关卡系数
                _mirrorHero = []
                for hero in _preUserFightData:
                    if "hid" not in hero:
                        hero["side"] = 1
                        _mirrorHero.append(hero)
                        continue
                    hero["side"] = 1
                    hero["hp"] = int(hero["hp"] * _layerCon["mirror"]["hp"])
                    hero["atk"] = int(hero["atk"] * _layerCon["mirror"]["atk"])
                    hero["maxhp"] = hero["hp"]
                    _mirrorHero.append(hero)


                _setData["mirror"] = _data["mirror"] = {"headdata": _chkFightData['headdata'], "herolist": _mirrorHero}

                _data["mirrornum"] = 0
            _setData["mirrornum"] = _data["mirrornum"]
        else:
            _prize = _layerCon["mirrorprize"]
            _setData["killmirror"] = _data["killmirror"] = 1

        # 设置已经使用过的英雄
        _tidList = [v for k, v in _fightData.items() if k not in ["sqid"]]
        _data["usehero"].extend(_tidList)
        _setData["usehero"] = _data["usehero"]

        _prizeData = g.getPrizeRes(uid, _prize, {'act': "shilianzt_fightboss", "prize": _prize, "type": _act})
        g.sendChangeInfo(conn, _prizeData)
        _resData["prize"] = _prize
    g.m.shilianztfun.setData(uid, _setData)
    _resData["mydata"] = _data
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = '55210_60c87ed23d8c4258e1043ad4'
    g.debugConn.uid = uid
    _data = [1, {
        "1": "60dd96a43d8c424430a18011",
        "2": "60cf5ae83d8c4258de70fc90",
        "3": "60e6ff3f3d8c4217cad6bb5e",
        "4": "60f42ccf3d8c424ab83399c5",
        "5": "60f80d613d8c424aba410163",
        "6": "60f80d1a3d8c424aba410160",

    }]
    _con = dict(g.GC["shilianztcom"])
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'