#!/usr/bin/python
# coding:utf-8

import sys,random

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
皇陵探宝 - 事件处理
'''
def proc(conn, data,key=None):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 点击格子的数据
    _idx = int(data[0])

    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = dict(g.GC["shilianztcom"])
    _data = g.m.shilianztfun.getData(uid)
    _nt = g.C.NOW()

    # 数据不存在
    if not _data:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('hltb_fight_res_-2')
        return _chkData

    # 判断是否已经完成
    if _idx in _data["finishevent"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('hltb_fight_res_-2')
        return _chkData


    _chkData["setdata"] = {}
    # 获取当前格子的eid
    _eid = _data["eventdata"][_idx]["eid"]

    # 秘宝
    if _eid == "1":
        _fightData = data[1]

        # 检查战斗参数
        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
        if _chkFightData['chkres'] < 1:
            _chkData['s'] = _chkFightData['chkres']
            _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
            return _chkData

        _layer = _data["layer"]
        _layerCon = g.m.shilianztfun.getCon(_data["layer"])
        _chkData["prize"] = _layerCon["defprize"]
        _chkData["npcid"] = _layerCon["defboss"]
        _chkData["chkfightdata"] = _chkFightData
        _chkData["fightdata"] = _fightData

    # buff类
    elif _eid == "2":
        _idx2 = int(data[1])
        # 获取额外的buff
        _data["addbuff"] = {}
        _extBuff = _data["extbuff"]
        _bufflist = _data.get("bufflist", [])
        _buffid = _data["eventdata"][_idx]["bid"][_idx2]
        _buffCon = g.GC["shilianztbuff"][_buffid]
        _buff = _buffCon["parameter"]["buff"]
        _job = _buffCon["parameter"].get("job", -1)
        for k, v in _buff.items():
            # 加上对应职业的条件
            if _job != -1:
                k += "_" + str(_job)
            _key = k
            if _key not in _extBuff: _extBuff[_key] = 0
            if _key not in _data["addbuff"]: _data["addbuff"][_key] = 0
            _extBuff[_key] += v
            _data["addbuff"][_key] += v
        _chkData["extbuff"] = _data["extbuff"] = _extBuff
        _chkData["setdata"].update({"extbuff": _extBuff})
        # 加入buffid
        _bufflist.append(_buffid)
        _chkData["setdata"].update({"bufflist":_bufflist})
        _chkData["addbuff"] = _data["addbuff"]


    # 摸金商店
    elif _eid == "4":
        _idx2 = int(data[1])
        _itemList = _data["eventdata"][_idx]["itemlist"]
        # 参数是否正确
        if _idx2 < 0 or _idx2 >= len(_itemList):
            _chkData['s'] = -6
            _chkData['errmsg'] = g.L('hltb_even_res_-4')
            return _chkData

        _item = _itemList[_idx2]
        # 判断是否还有购买次数
        if _item["buynum"] <= 0 and _item["buynum"] != -1:
            _chkData['s'] = -7
            _chkData['errmsg'] = g.L('hltb_even_res_-5')
            return _chkData
        if _item["buynum"] != -1:
            _item["buynum"] += -1
        # 判断消耗是否满足条件
        _sale = _item['sale']
        _need = g.C.dcopy(_item['need'])
        for i in _need:
            i['n'] = int(_sale * 0.1 * i['n'])
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
        _chkData["prize"] = [_item["item"]]
        _itemList[_idx2] = _item

        _data["eventdata"][_idx]["itemlist"] = _itemList
        _chkData["setdata"].update({"eventdata": _data["eventdata"]})

    # 知识问答
    elif _eid in ("3"):
        _answerid = str(data[1])

        # 获取题库的对应的下标
        _idx2 = _data["eventdata"][_idx]["idx"]
        # 获取题正确答案
        _right = _con["questions"][_idx2]["right"]
        if _right == _answerid:
            _chkData["prize"] = _con["questions"][_idx2]["prize"]
        else:  # 回答错误也有奖励
            _chkData["prize"] = _con["questions"][_idx2]["prize2"]

    _chkData["data"] = _data
    _chkData["eid"] = _eid
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
    _eid = _chkData["eid"]

    _idx = int(data[0])

    # 如果有消耗
    if "need" in _chkData:
        _delData = g.delNeed(uid, _chkData["need"], logdata={'act': 'shilianzt_even', "need": _chkData["need"],  "eid": _eid, "idx": _idx})
        g.sendChangeInfo(conn, _delData)


    _setData = _chkData["setdata"]

    # 判断是否有npc需要战斗
    if "npcid" in _chkData:
        _chkFightData = _chkData["chkfightdata"]
        _fightData = _chkData["fightdata"]
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
        # boss战斗信息
        _bossFightData = g.m.fightfun.getNpcFightData(_chkData["npcid"])
        f = ZBFight('pve')
        _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
        _winside = _fightRes['winside']
        _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
        _resData['fightres'] = _fightRes
        # 赢了就加入完成事件
        if _winside == 0:
            _data["finishevent"].append(_idx)
            _setData["finishevent"] = _data["finishevent"]

            _tidList = [v for k, v in _fightData.items() if k not in ["sqid"]]
            _data["usehero"].extend(_tidList)
            _setData["usehero"] = _data["usehero"]

            if "prize" in _chkData:
                _prizeData = g.getPrizeRes(uid, _chkData["prize"],
                                           {'act': "shilianzt_even", "prize": _chkData["prize"], "eid": _eid,
                                            "idx": _idx})
                g.sendChangeInfo(conn, _prizeData)
                _resData["prize"] = _chkData["prize"]
                del _chkData["prize"]


    if "prize" in _chkData:
        _prizeData = g.getPrizeRes(uid, _chkData["prize"],
                                   {'act': "shilianzt_even", "prize": _chkData["prize"], "eid": _eid,
                                    "idx": _idx})
        g.sendChangeInfo(conn, _prizeData)
        _resData["prize"] = _chkData["prize"]

    # 加入完成的格子数
    if _eid not in ["4", "1"]:
        _data["finishevent"].append(_idx)
        _setData["finishevent"] = _data["finishevent"]
    g.m.shilianztfun.setData(uid, _setData)
    if "extbuff" in _chkData:
        _resData["extbuff"] = _chkData["extbuff"]
        _resData["addbuff"] = _chkData["addbuff"]

    _resData["mydata"] = _data
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('1')
    g.debugConn.uid = uid
    _data = [1, {"1":"60c0d2daba8d56a4159c2352"}]
    _extBuff = {}
    _buffid = 20
    _buffCon = g.GC["shilianztbuff"][str(_buffid)]
    _buff = _buffCon["parameter"]["buff"]
    _job = _buffCon["parameter"].get("job", -1)
    for k, v in _buff.items():
        # 加上对应职业的条件
        if _job != -1:
            k += "_" + str(_job)
        _key = k
        if _key not in _extBuff: _extBuff[_key] = 0
        if _key not in _data["addbuff"]: _data["addbuff"][_key] = 0
        _extBuff[_key] += v
        _data["addbuff"][_key] += v
    pprint(_r)
    print 'ok'