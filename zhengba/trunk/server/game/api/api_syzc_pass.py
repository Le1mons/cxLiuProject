#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
噬渊战场 - 下一关
'''
def proc(conn, data,key=None):
    """

    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _saodao = data[0]
    # 判断是否开启
    if not g.chkOpenCond(uid, 'syzc'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData
    _con = dict(g.GC["syzccom"])
    _data = g.m.syzcfun.getData(uid)
    # 请先去重置
    _week = g.m.syzcfun.getWeek()
    if "week" not in _data or _data["week"] != _week:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    # 今天已经没有挑战次数了
    if _data["layernum"] >= _data["maxlayernum"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-4')
        return _chkData

    # 获取boss的战斗数据
    if not g.m.syzcfun.getDeadHeroNum(_data["eventdata"]["3"].values()[0]['herolist']):
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('syzc_event_res_-7')
        return _chkData
    # if _data["eventdata"]["3"].keys()[0] not in _data["finishgzid"]:
    #     _chkData['s'] = -5
    #     _chkData['errmsg'] = g.L('syzc_event_res_-7')
    #     return _chkData

    # 判断英雄是全部阵亡
    _deadTeamNum = 0
    for team in _data["herodata"]:
        if g.m.syzcfun.getDeadHeroNum(team):
            _deadTeamNum += 1
    if _deadTeamNum >= 3:
        _chkData['s'] = -6
        _chkData['errmsg'] = g.L('syzc_event_res_-6')
        return _chkData

    # 判断是否可以扫荡
    if _saodao:
        # 判断是否超过十层
        if _data["layer"] < 10:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-4')
            return _chkData
        # 判断下一层是否可以扫荡
        _syzcMapInfoCon = g.GC['syzcmapinfo']
        if str(_data['layer'] + 1) not in _syzcMapInfoCon or _syzcMapInfoCon[str(_data['layer'] + 1)]["type"]:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-4')
            return _chkData

    _chkData["data"] = _data
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
    _saodao = data[0]

    _data = _chkData["data"]

    _syzcMapInfoCon = g.GC['syzcmapinfo']
    _setData = {}
    # 最后一层就通关
    _data["layer"] += 1
    # 如果还有下一层
    if str(_data['layer']) in _syzcMapInfoCon:
        _generate = g.m.syzcfun.generateEvent(uid, _data["layer"])
        _setData["layer"] = _data["layer"]

        _setData.update(_generate)
        _data.update(_generate)

        # 如果是扫荡
        if _saodao:
            for gzid, eid in _data["eventgzid"].items():
                if eid in ("3",):
                    # 循环
                    for hero in _setData["eventdata"]["3"][gzid]["herolist"]:
                        hero["hp"] = 0
                        hero["dead"] = True

                    _setData["eventgzid"][gzid] = "55"
                    _setData["eventdata"].setdefault("55", {})[gzid] = {}
                    _setData["layernum"] = _data["layernum"] + 1
                    if _data["layer"] > _data["toplayer"]:
                        _setData["toplayer"] = _data["layer"]
                    continue

                _setData["finishgzid"].append(gzid)
                _setData["miwu"] = 1
            _data.update(_setData)
            _prize = _syzcMapInfoCon[str(_data['layer'])]["saodang"]
            _prizeData = g.getPrizeRes(uid, _prize,{'act': "syzc_pass", "prize": _prize})
            g.sendChangeInfo(conn, _prizeData)
            _resData["prize"] = _prize
            g.event.emit("stagefundExp", uid, "syzc")


    g.m.syzcfun.setData(uid, _setData)
    _resData["mydata"] = _data

    # # 获取本层获得的所有奖励
    # _layerPrize = g.m.syzcfun.getLayerPrize(uid)
    # # 合并奖励
    # _prize = g.mergePrize(_layerPrize)
    #
    # _resData["prize"] = _prize


    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('ysr1')


    g.debugConn.uid = uid
    _data = [1]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'