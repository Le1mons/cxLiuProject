#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
噬渊战场 - 使用道具
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

    # 英雄的站位信息
    _id = str(data[0])
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
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _useinfo = _con["useinfo"][_id]

    # 判断消耗
    _need = _useinfo["need"]
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
    _chkData["need"] = _need
    _chkData["setdata"] = {}
    # 判断使用的不同类型
    # 如果是血瓶
    if _id == "1":
        # 使用的队伍
        _idx = int(data[1])
        # 使用的英雄已死亡
        _maxNum = 0
        _dead = 0
        for i in _data["herodata"][_idx]:
            if "hid" not in i:
                continue
            _maxNum += 1
            if 'hp' in i and i['hp'] <= 0:
                _dead += 1

        if _dead >= _maxNum:
            _chkData['s'] = -6
            _chkData['errmsg'] = g.L('hltb_fight_res_-6')
            return _chkData

        # 增加最大血量的百分之50
        for hero in _data["herodata"][_idx]:
            if "hid" not in hero:
                continue
            _addHp = int(hero["maxhp"] * _useinfo["pro"] / 1000)
            hero["hp"] += _addHp
        _chkData["setdata"].update({"herodata": _data["herodata"]})
    elif _id == "2":
        _idx = int(data[1])
        # 使用的英雄已死亡
        _maxNum = 0
        _dead = 0
        for i in _data["herodata"][_idx]:
            if "hid" not in i:
                continue
            _maxNum += 1
            if 'hp' in i and i['hp'] <= 0:
                _dead += 1

        if _dead <= 0:
            _chkData['s'] = -6
            _chkData['errmsg'] = g.L('syzc_event_res_-8')
            return _chkData

        # 增加最大血量的百分之50
        for hero in _data["herodata"][_idx]:
            if "hid" not in hero:
                continue
            if hero["hp"] > 0 or not hero["dead"]:
                continue

            hero["hp"] = int(hero["maxhp"] * _useinfo["pro"] / 1000)
            hero["dead"] = False
        _chkData["setdata"].update({"herodata": _data["herodata"]})

    elif _id == "3":
        _gzidList = data[1]

        _prize = []
        for gzid in _gzidList:
            _finishgz = []
            _eid = _data["eventgzid"][str(gzid)]
            if str(_eid) not in ("2", "3", "12", "14", "60", ):
                continue

            _eventData = _data["eventdata"][_eid][gzid]
            if _eid == "60":
                _eventData = _data["eventdata"]["3"].values()[0]

            _maxNum = 0
            _deadNum = 0
            for hero in _data["eventdata"][_eid][gzid]["herolist"]:
                if "hid" not in hero:
                    continue
                _maxNum += 1
                hero["hp"] = int(hero["maxhp"] * _useinfo["pro"] / 1000)
                if hero["hp"] <= 0:
                    hero["dead"] = True
                    _deadNum += 1
            # 如果全死了
            if _deadNum >= _maxNum:
                _mapInfo = dict(g.GC["syzcmapinfo"])[str(_data["layer"])]
                if _eid in ("12", "14",):
                    _finishgz = [gzid]
                    _finishgz.append(_eventData["startid"])
                    _chkData["prize"] = _eventData["prize"]
                # 如果是小怪
                elif _eid == "2":
                    _finishgz = [gzid]
                    _chkData["prize"] = _mapInfo["npcprize"]
                # 如果是boss
                elif _eid == "3":
                    _prize.extend(_mapInfo["bossprize"])
                    _finishgz.extend(_data["eventdata"]["60"].keys())
                    _data["eventdata"].setdefault("55", {})[gzid] = {}
                    _data["eventgzid"][gzid] = "55"
                    _data["layernum"] += 1
                    _chkData["setdata"]["layernum"] = _data["layernum"]
                    if _data["layer"] > _data["toplayer"]:
                        _chkData["setdata"]["toplayer"] = _data["layer"]
                    g.event.emit("stagefundExp", uid, "syzc")
                # 如果是boss旁边的格子
                elif _eid == "60":
                    _finishgz = _data["eventdata"][_eid].keys()
                    _prize.extend(_mapInfo["bossprize"])
                    _data["eventdata"].setdefault("55", {})[_data["eventdata"]["3"].keys()[0]] = {}
                    _data["eventgzid"][_data["eventdata"]["3"].keys()[0]] = "55"
                    _data["layernum"] += 1
                    _chkData["setdata"]["layernum"] = _data["layernum"]
                    if _data["layer"] > _data["toplayer"]:
                        _chkData["setdata"]["toplayer"] = _data["layer"]
                    g.event.emit("stagefundExp", uid, "syzc")

            _data["finishgzid"].extend(_finishgz)
        _chkData["setdata"].update({"eventdata": _data["eventdata"], "eventgzid":_data["eventgzid"]})
        _chkData["setdata"]["finishgzid"] = _data["finishgzid"]
        # 不算完成事件
        if _prize:
            _chkData["prize"] = _prize
    elif _id == "4":
        _data["miwu"] = 1
        _chkData["setdata"]["miwu"] = 1

    _chkData["data"] = _data

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄的站位信息
    _id = str(data[0])
    # 检测
    _chkData = _checkCond(uid, data)
    _resData = {}
    if _chkData["s"] != 1:
        return _chkData
    _data = _chkData["data"]
        # 如果有消耗
    if "need" in _chkData:
        _delData = g.delNeed(uid, _chkData["need"],
                             logdata={'act': 'hltb_use', "need": _chkData["need"], "key": _id})
        g.sendChangeInfo(conn, _delData)

        # 如果有奖励
    if "prize" in _chkData:
        _prizeData = g.getPrizeRes(uid, _chkData["prize"],
                                   {'act': "hltb_use", "prize": _chkData["prize"], "key": _id,
                                    "idx":_chkData.get("idx", "")})
        g.sendChangeInfo(conn, _prizeData)
        _resData["prize"] = _chkData["prize"]

    # 设置数据
    g.m.syzcfun.setData(uid, _chkData["setdata"])

    _resData["mydata"] = _data

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('10')
    g.debugConn.uid = uid
    gud = g.getGud(uid)

    _prizeData = g.getPrizeRes(uid, [{"a": "item", "t": "1216", "n": 10}],
                               {'act': "hltb_use"})
    _data = ["2", 2]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'