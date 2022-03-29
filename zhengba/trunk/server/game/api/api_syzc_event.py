#!/usr/bin/python
# coding:utf-8

import sys,random

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
噬渊战场 - 触发事件和走路
'''
def proc(conn, data,key=None):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1


    # 点击的格子
    _clickId = str(data[0])
    # 是否放弃
    _waive = bool(data[1])
    # 额外的参数
    _extData = data[2]

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
    _chkData["setdata"] = {}

    # 判断格子是否存在 且没有放弃
    if _clickId in _data["eventgzid"]:
        _mapInfo = dict(g.GC["syzcmapinfo"])[str(_data["layer"])]
        _mapConName = _mapInfo["map"]
        _mapCon = g.GC[_mapConName]

        _chkData["finishgz"] = [_clickId]
        # 获取当前格子的eid
        _eid = _data["eventgzid"][_clickId]
        # 当前位置没有事件处理
        if _eid in ("55", ):
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('syzc_event_res_-3')
            return _chkData

        if _clickId in _data["finishgzid"] and _eid not in ("27",):
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('syzc_event_res_-3')
            return _chkData


        _event = _con["eventinfo"][str(_eid)]
        # 判断是否放弃事件
        if not _waive:
            # 老萨满
            if _eid in ("4", "37", "44", ):
                _winNum = _extData["winnum"]
                if _winNum > 0:
                    beishu = _con["saman"]["beishu"]
                    _pro = 0
                    for i in xrange(_winNum):
                        _pro += beishu[i]
                    _prize = g.mergePrize(_event["prize"] * _pro)
                    _chkData["prize"] = _prize
            # 指挥官
            elif _eid in ("5", ):
                _win = _extData["win"]
                # 如果赢了就发奖
                if _win:
                    _dlz = _event["dlz"]
                    _chkData["prize"] = g.m.diaoluofun.getGroupPrize(_dlz)

            # 奖励事件
            elif _eid in ("19", "20", ):
                _chkData["prize"] = _data["eventdata"][_eid][_clickId]
            # 解密宝箱：
            elif _eid in ("33", ):
                _dlz = _event["dlz"]
                _chkData["prize"] = g.m.diaoluofun.getGroupPrize(_dlz)

            # 情报和宝箱事件
            elif _eid in ("50", "51", "53", "54", "52"):
                _need = _event["need"]

                _chkData["need"] = _need
                _chkData["prize"] = _event["prize"]

            # 宝箱事件
            elif _eid in ("6", "16", "17", "18",):
                _need = _event["need"]

                _chkData["need"] = _need
                _dlz = _event["dlz"]
                _chkData["prize"] = g.m.diaoluofun.getGroupPrize(_dlz)


            # 路障事件
            elif _eid in ("21", "22", "23", ):
                _id = _extData["id"]
                _need = _event["needinfo"][_id]
                _chk = g.chkDelNeed(uid, _need)
                _chkData["need"] = _need

            # 商店
            elif _eid in ("15", ):
                _idx = _extData["idx"]
                _num = _extData.get("num", 1)
                _itemList = _data["eventdata"][_eid][_clickId]
                # 参数是否正确
                if _idx < 0 or _idx >= len(_itemList):
                    _chkData['s'] = -6
                    _chkData['errmsg'] = g.L('global_argserr')
                    return _chkData

                _item = _itemList[_idx]
                # 判断是否还有购买次数
                if _item["buynum"] - _num < 0:
                    _chkData['s'] = -7
                    _chkData['errmsg'] = g.L('dianjin_lingqu_res_-3')
                    return _chkData

                _item["buynum"] -= _num
                # 判断消耗是否满足条件
                _sale = _item['sale']
                _need = g.C.dcopy(_item['need'])
                for i in _need:
                    i['n'] = int(_sale * 0.1 * i['n'])

                _prize = g.mergePrize([_item["item"]] * _num)

                _chkData["need"] = _need
                _chkData["prize"] = _prize
                _itemList[_idx] = _item

                _data["eventdata"][_eid][_clickId] = _itemList
                _chkData["setdata"].update({"eventdata": _data["eventdata"]})
                # 不算完成事件
                _chkData["finishgz"] = []
                for item in _itemList:
                    if item["buynum"] > 0:
                        break
                else:
                    _chkData["finishgz"] = [_clickId]

            # 委托事件 - 接取
            elif _eid in ("7", "8", "9", "10", ):
                _nt = g.C.NOW()
                # 任务已经接取
                if _data["eventdata"][_eid][_clickId]:
                    _chkData['s'] = -6
                    _chkData['errmsg'] = g.L("xstask_jiequ_res_-5")
                    return _chkData
                # 随机目标点
                _gzidlist = []
                for _id, info in _mapCon.items():
                    if str(int(_id) + 1) in _data["eventgzid"] or str(int(_id) - 1) in _data["eventgzid"] or _id in _data["eventgzid"] or info["typeid"] == "0":
                        continue
                    _gzidlist.append(_id)
                _randomGzId = g.C.RANDLIST(_gzidlist)[0]
                _data["eventdata"][_eid][_clickId] = {"endtime": _nt + _event["time"], "targetid":_randomGzId}

                _dlz = _event["dlz"]
                _prize = g.m.diaoluofun.getGroupPrize(_dlz)
                _data["eventdata"].setdefault(str(_event["target"]), {})[_randomGzId] = {"startid": _clickId, "prize": _prize}
                # 如果是战斗
                if _eid in ("8", "10", ):
                    _targetEvent = _con["eventinfo"][str(_event["target"])]
                    _fightData = g.m.fightfun.getNpcFightData(_targetEvent["npc"])
                    _data["eventdata"][str(_event["target"])][_randomGzId].update(_fightData)

                _data["eventgzid"][_randomGzId] = str(_event["target"])
                _chkData["setdata"]["eventdata"] = _data["eventdata"]
                _chkData["setdata"]["eventgzid"] = _data["eventgzid"]
                # 不算完成事件
                _chkData["finishgz"] = []
            # 委托事件1 - 完成
            elif _eid in ("11", "13", ):
                _eventData = _data["eventdata"].get(_eid,{}).get(_clickId)
                if not _eventData:
                    _chkData['s'] = -6
                    _chkData['errmsg'] = g.L('hltb_even_res_-4')
                    return _chkData
                # 任务已经接取
                _startid = _eventData["startid"]
                _startEid = _data["eventgzid"][_startid]
                _nt = g.C.NOW()
                _chkData["finishgz"].append(_eventData["startid"])
                if _nt <= _data["eventdata"][_startEid][_startid]["endtime"]:
                    _chkData["prize"] = _eventData["prize"]
                else:
                    _chkData["errmsg"] = g.L("syzc_event_res_-5")

            # 委托事件2 - 完成
            elif _eid in ("12", "2", "3", "14", "60", ):
                _idx = _extData["idx"]
                _eventData = _data["eventdata"][_eid][_clickId]
                if _eid == "60":
                    _eventData = _data["eventdata"]["3"].values()[0]

                if g.m.syzcfun.getDeadHeroNum(_eventData["herolist"]):
                    _chkData['s'] = -4
                    _chkData['errmsg'] = g.L('syzc_event_res_-6')
                    return _chkData


                _fightData = _data["herodata"][_idx]
                _fight2Data = g.C.dcopy(_fightData)
                f = ZBFight('pvm')
                # 地方血量继承
                f.initFightByData(_fightData + _eventData["herolist"])

                # 我方继承血量
                _myLess, _mynuqiLess = {}, {}
                for ele in _fightData:
                    if ele["hp"] <= 0 or ele["dead"]:
                        _myLess[str(ele["pos"])] = 0
                        _mynuqiLess[str(ele["pos"])] = 0
                        continue
                    _myLess[str(ele["pos"])] = int(float(ele['hp']) / ele["maxhp"] * 10000) / 100
                    _mynuqiLess[str(ele["pos"])] = int(float(ele['nuqi']) / ele["maxnuqi"] * 10000) / 100
                # 敌方继续血量
                _enemyLess, _nuqiLess = {}, {}
                for ele in _eventData["herolist"]:
                    if ele["hp"] <= 0 or ele["dead"]:
                        _enemyLess[str(ele["pos"])] = 0
                        _nuqiLess[str(ele["pos"])] = 0
                        continue
                    _enemyLess[str(ele["pos"])] = int(float(ele['hp']) / ele["maxhp"] * 10000) / 100
                    _nuqiLess[str(ele["pos"])] = int(float(ele['nuqi']) / ele["maxhp"] * 10000) / 100
                f.setSZJRoleHp(0, _myLess)
                f.setRoleNuqi(0, _mynuqiLess)
                f.setSZJRoleHp(1, _enemyLess)
                f.setRoleNuqi(1, _nuqiLess)
                # 战斗开始
                _fightRes = f.start()
                _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _eventData["headdata"]]

                _chkEnemyHp = 0
                # 记录对手的残余状态
                for k, v in _fightRes['fightres'].items():
                    for i in _eventData["herolist"]:
                        # 对方角色,把战斗后的怒气和hp更新到数据上
                        if v['side'] == 1 and 'pos' in v and 'pos' in i and v['pos'] == i['pos']:
                            if v['hp'] <= 0 or v["dead"]:
                                _percent = 0

                            else:
                                _percent = int(float(v['hp']) / v["maxhp"] * 10000)
                            _lessHp = int(i['maxhp'] * _percent / 10000)
                            i["hp"] = _lessHp if _lessHp > 0 else 0
                            # 如果血量大于1
                            if i["hp"] <= 0:
                                i["dead"] = True
                            i["nuqi"] = int(v["nuqi"])
                    # 记录自己的残余状态
                    for i in _fightData:
                        # 己方角色
                        if v['side'] == 0 and 'pos' in v and 'pos' in i and v['pos'] == i['pos']:
                            if v['hp'] <= 0 or v["dead"]:
                                _percent = 0
                            else:
                                _percent = int(float(v['hp']) / v["maxhp"] * 10000)
                            _lessHp = int(i['maxhp'] * _percent / 10000)
                            i["hp"] = _lessHp if _lessHp > 0 else 0
                            if i["hp"] <= 0:
                                i["dead"] = True
                            i["nuqi"] = int(v["nuqi"])
                _winside = _fightRes['winside']
                _chkData["finishgz"] = []
                if not _winside or _winside == -1:
                    if _eid in ("12", "14", ):
                        _chkData["finishgz"] = [_clickId]
                        _chkData["finishgz"].append(_eventData["startid"])
                        _nt = g.C.NOW()

                    # 如果是小怪
                    elif _eid == "2":
                        _chkData["finishgz"] = [_clickId]
                        _chkData["prize"] = _mapInfo["npcprize"]

                    # 如果是boss
                    elif _eid == "3":
                        _chkData["prize"] = _mapInfo["bossprize"]
                        _chkData["finishgz"].extend(_data["eventdata"]["60"].keys())
                        _data["eventdata"].setdefault("55", {})[_clickId] = {}
                        _data["eventgzid"][_clickId] = "55"
                        _data["layernum"] += 1
                        _chkData["setdata"]["layernum"] = _data["layernum"]
                        if _data["layer"] > _data["toplayer"]:
                            _chkData["setdata"]["toplayer"] = _data["layer"]
                        g.event.emit("stagefundExp", uid, "syzc")
                    # 如果是boss旁边的格子
                    elif _eid == "60":
                        _chkData["finishgz"] = _data["eventdata"][_eid].keys()
                        _chkData["prize"] = _mapInfo["bossprize"]
                        _data["eventdata"].setdefault("55", {})[_data["eventdata"]["3"].keys()[0]] = {}
                        _data["eventgzid"][_data["eventdata"]["3"].keys()[0]] = "55"
                        _data["layernum"] += 1
                        _chkData["setdata"]["layernum"] = _data["layernum"]
                        if _data["layer"] > _data["toplayer"]:
                            _chkData["setdata"]["toplayer"] = _data["layer"]

                        g.event.emit("stagefundExp", uid, "syzc")
                # 加入战斗日志
                g.m.syzcfun.addVideo(uid, _data["layer"], _fightRes, _winside, _week, _eid)
                _data["eventdata"][_eid][_clickId]["herolist"] = _eventData["herolist"]
                _data["herodata"][_idx] = _fightData
                _chkData["setdata"]["eventdata"] = _data["eventdata"]
                _chkData["setdata"]["eventgzid"] = _data["eventgzid"]
                _chkData["setdata"]["herodata"] = _data["herodata"]
                _chkData["fightres"] = _fightRes
                if _eid in ("12", "14",):
                    _startid = _eventData["startid"]
                    _startEid = _data["eventgzid"][_startid]
                    _nt = g.C.NOW()

                    if _nt <= _data["eventdata"][_startEid][_startid]["endtime"]:
                        _chkData["prize"] = _eventData["prize"]
                    else:
                        _chkData["errmsg"] = g.L("syzc_event_res_-5")
                        del _chkData["fightres"]
                        _chkData["setdata"] = {}
            # 判断情报传输点
            elif _eid in ("26", ):
                _order = _data["eventdata"][_eid][_clickId]["order"]

                _lwtOrder = _data["liaowangta"]
                # 判断是否是正确的塔
                if _lwtOrder + 1 != _order:
                    _chkData['s'] = -10
                    _chkData['errmsg'] = g.L('syzc_event_res_-1')
                    return _chkData
                _data["liaowangta"] = _order
                # 如果按顺序集齐了所有瞭望塔
                if _order >= len(_data["eventdata"][_eid]):
                    _data["eventdata"].setdefault("33", {})[_data["nowgzid"]] = {}
                    _data["eventgzid"][_data["nowgzid"]] = "33"
                    _chkData["setdata"]["eventdata"] = _data["eventdata"]
                    _chkData["setdata"]["eventgzid"] = _data["eventgzid"]
                _chkData["setdata"]["liaowangta"] = _data["liaowangta"]
            # 判断情报传输点
            elif _eid in ("29", "30", "31", "32", ):

                _chkData["finishgz"] = []
                _shiyuanshi = _data["shiyuanshi"]
                if _shiyuanshi["jiequ"]:
                    _jiequEid = _shiyuanshi["jiequ"].keys()[0]
                    _jiequGzid = _shiyuanshi["jiequ"][_jiequEid]
                    if _eid != _jiequEid:
                        _shiyuanshi["jiequ"] = {}
                    else:
                        # 如果点击同一个需要弹出提示
                        if _jiequGzid == _clickId:
                            _chkData['s'] = -11
                            _chkData['errmsg'] = g.L('syzc_event_res_-2')
                            return _chkData
                        else:
                            _shiyuanshi["finish"] += 1
                            _shiyuanshi["jiequ"] = {}
                            _chkData["finishgz"] = [_clickId, _jiequGzid]

                else:
                    _shiyuanshi["jiequ"] = {_eid:_clickId}

                _data["shiyuanshi"] = _shiyuanshi
                _chkData["setdata"]["shiyuanshi"] = _shiyuanshi
                # 需要完成数据次数
                _maxFinish = 0
                for eid2 in _data["eventdata"]:
                    if eid2 in ("29", "30", "31", "32", ):
                        _maxFinish += 1

                # 如果全部都完成了
                if _shiyuanshi["finish"] >= _maxFinish:
                    _data["eventdata"].setdefault("33", {})[_data["nowgzid"]] = {}
                    _data["eventgzid"][_data["nowgzid"]] = "33"
                    _chkData["setdata"]["eventdata"] = _data["eventdata"]
                    _chkData["setdata"]["eventgzid"] = _data["eventgzid"]

            # 运输解密开始事件（推箱子）
            elif _eid in ("27", ):
                _yunshu = _data["yunshu"]
                # 如果任务已经接取且当前不是下车逻辑
                if _yunshu["jiequ"]:
                    if "xiache" not in _extData:
                        _chkData['s'] = -13
                        _chkData['errmsg'] = g.L('syzc_event_res_-4')
                        return _chkData
                    else:

                        _boxGzId = _extData["xiache"]
                        # 删除原来的位置的事件
                        _data["eventgzid"][_data["nowgzid"]] = _eid
                        _data["eventdata"][_eid][_data["nowgzid"]] = _data["eventdata"][_eid][_clickId]

                        if _clickId in _data["finishgzid"]:
                            _data["finishgzid"].remove(_clickId)
                            _chkData["finishgz"] = []
                        if _data["nowgzid"] in _data["finishgzid"]:
                            _data["finishgzid"].remove(_data["nowgzid"])
                        if _clickId != _data["nowgzid"]:
                            if _clickId in _data["eventgzid"]:
                                del _data["eventgzid"][_clickId]
                            if _clickId in _data["eventdata"]["27"]:
                                del _data["eventdata"]["27"][_clickId]

                        _chkData["setdata"]["eventdata"] = _data["eventdata"]
                        _chkData["setdata"]["eventgzid"] = _data["eventgzid"]
                        _chkData["setdata"]["nowgzid"] = _data["nowgzid"] = _boxGzId
                        _yunshu["jiequ"] = ""
                        _chkData["setdata"]["yunshu"] = _yunshu

                else:
                    _yunshu["jiequ"] = _clickId
                    _data["yunshu"] = _yunshu
                    _chkData["setdata"]["yunshu"] = _yunshu

            # 运输解密结束事件（推箱子）
            elif _eid in ("28", ):
                _boxGzId = _extData["xiache"]
                _chkData["finishgz"] = []
                _yunshu = _data["yunshu"]
                if _yunshu["jiequ"]:
                    _jiequGzid = _yunshu["jiequ"]
                    # 检查两个地点是否是同一个类型的
                    if _data["eventdata"]["27"][_jiequGzid]["graph"] != _data["eventdata"]["28"][_clickId]["graph"]:
                        _chkData['s'] = -12
                        _chkData['errmsg'] = g.L('syzc_event_res_-3')
                        return _chkData
                    else:
                        _yunshu["finish"] += 1
                        _yunshu["jiequ"] = ""
                        _data["eventgzid"][_clickId] = "61"
                        _data["eventdata"].setdefault("61", {})[_clickId] = {}
                        _chkData["setdata"]["eventdata"] = _data["eventdata"]
                        _chkData["setdata"]["eventgzid"] = _data["eventgzid"]
                        _chkData["setdata"]["nowgzid"] = _data["nowgzid"] = _boxGzId

                    _data["yunshu"] = _yunshu
                    _chkData["setdata"]["yunshu"] = _yunshu
                    # 需要完成
                    _maxFinish = len(_data["eventdata"][_eid])

                    # 如果全部都完成了
                    if _yunshu["finish"] >= _maxFinish:
                        _data["eventdata"].setdefault("33", {})[_boxGzId] = {}
                        _data["eventgzid"][_boxGzId] = "33"
                        _chkData["setdata"]["eventdata"] = _data["eventdata"]
                        _chkData["setdata"]["eventgzid"] = _data["eventgzid"]


            # 解密走格子
            elif _eid in ("34", "36",):
                _chkData["finishgz"] = []
            # 解密事件
            elif _eid in ("35",):
                _chkData["finishgz"] = []
                _data["eventdata"].setdefault("33", {})[_data["nowgzid"]] = {}
                _data["eventgzid"][_data["nowgzid"]] = "33"
                _chkData["setdata"]["eventdata"] = _data["eventdata"]
                _chkData["setdata"]["eventgzid"] = _data["eventgzid"]

                _chkData["finishgz"].extend(_data["eventdata"]["34"].keys())
                _chkData["finishgz"].extend(_data["eventdata"]["36"].keys())
            _chkData["eid"] = _eid
            # 判读消耗是否充足
            if "need" in _chkData:
                _chk = g.chkDelNeed(uid, _chkData["need"])
                # 材料不足
                if not _chk['res']:
                    if _chk['a'] == 'attr':
                        _chkData['s'] = -100
                        _chkData['attr'] = _chk['t']
                    else:
                        _chkData["s"] = -104
                        _chkData[_chk['a']] = _chk['t']
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
    _data = _chkData["data"]

    # 点击的格子
    _clickId = str(data[0])
    # 是否放弃
    _waive = bool(data[1])
    # 额外的参数
    _extData = data[2]

    _eid = _chkData.get("eid", 0)
    # 如果有消耗
    if "need" in _chkData:
        _delData = g.delNeed(uid, _chkData["need"], logdata={'act': 'syzc_even', "need": _chkData["need"], "eid": _eid})
        g.sendChangeInfo(conn, _delData)

    # 如果有奖励
    if "prize" in _chkData:
        _prizeData = g.getPrizeRes(uid, _chkData["prize"], {'act': "syzc_even", "prize": _chkData["prize"], "eid": _eid})
        g.sendChangeInfo(conn, _prizeData)
        _resData["prize"] = _chkData["prize"]

    _setData = _chkData["setdata"]

    # 加入完成的格子数
    if "finishgz" in _chkData:
        _data["finishgzid"].extend(_chkData["finishgz"])
        _data["finishgzid"] = list(set(_data["finishgzid"]))
        _setData["finishgzid"] = _data["finishgzid"]
    if "fightres" in _chkData:
        _resData["fightres"] = _chkData["fightres"]
    if _setData:
        g.m.syzcfun.setData(uid, _setData)
    _resData["mydata"] = _data
    # 判断是否有提示语
    if "errmsg" in _chkData:
        _res["errmsg"] = _chkData["errmsg"]
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('1')
    g.debugConn.uid = uid
    _data = [908,False,{}]
    # _r = doproc(g.debugConn, _data)
    _winNum = 3
    _con = dict(g.GC["syzccom"])
    beishu = _con["saman"]["beishu"]
    _pro = 0
    for i in xrange(_winNum):
        _pro += beishu[i]
    pprint(_pro)
    print 'ok'