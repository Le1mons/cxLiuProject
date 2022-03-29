#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-自动上阵
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    #敌方uid
    _rivaluid = data[0]

    # 获取玩家匹配数据
    _pipeiData = g.m.gongpingjjcfun.getPipeiData(uid, keys="_id,equip,fightdata,selecthero,state,randhid,rivaluid,sid,npcfightdata,uuid,ctime")

    # 判断是否已经开始匹配
    if not _pipeiData:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_state_res_-1')
        return _chkData

    # 判断是否对手是否正确
    if _pipeiData["rivaluid"] != _rivaluid:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_autoembattle_res_-1')
        return _chkData


    # 获取
    _myState = _pipeiData["state"]
    _con = g.GC["gongpingjjc"]
    _embattle = _con["embattle"]
    # 当前状态不可做此操作
    if str(_myState - 1) not in _embattle:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gpjjc_embattle_res_-1')
        return _chkData

        # 如果不是npc
    if _rivaluid != "npc":
        # 获取对方玩家的匹配数据
        _rivalPipeiData = g.m.gongpingjjcfun.getPipeiData(_rivaluid,
                                                          keys="_id,equip,fightdata,selecthero,state,randhid,rivaluid,sid,npcfightdata")
        # 判断是否已经开始匹配
        if not _rivalPipeiData:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('gpjjc_state_res_-2')
            return _chkData

        # 判断是否有锁
        # 设置跨服缓存数据表示已经准备好了
        _ckey = "gpjjc_embattle_{}".format(_rivaluid)
        print "我被锁的key:",_ckey ,"---", uid
        _lock = g.crossMC.get(_ckey) or []
        if _lock:
            print "我被锁住了！！！！", uid
            _chkData['s'] = 1
            _chkData['d'] = {"fightdata": _rivalPipeiData["fightdata"]}

            # 设置跨服缓存数据表示已经准备好了
            _ckey = "gpjjc_state_{}_{}".format(_myState, _pipeiData["uuid"])
            _finishuid = g.crossMC.get(_ckey) or []
            if uid not in _finishuid:
                _finishuid.append(uid)
                print "当前完成的玩家uid", _finishuid, "gpjjc_autoembattle", "state:", _myState, "lock!!!!!!!!!!"
                # 设置缓存数量
                g.crossMC.set(_ckey, _finishuid, time=180)
                # 表示双方在这个阶段都准备好了
                if len(_finishuid) >= 2:
                    print "设置的玩家uid", _finishuid
                    g.m.gongpingjjcfun.emitEventFinish(_finishuid, _myState)

            return _chkData


        _chkData["rivalpipeidata"] = _rivalPipeiData

    _chkData["pipeidata"] = _pipeiData
    _chkData["state"] = _myState
    _chkData["rivaluid"] = _rivaluid

    return _chkData



@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1 or "d" in _chkData:
        return _chkData

    # 获取匹配数据
    _pipeiData = _chkData["pipeidata"]
    _myState = _chkData["state"]
    _rivaluid = _chkData["rivaluid"]

    _con = g.GC["gongpingjjc"]
    _embattle = _con["embattle"]

    # 如果不等于npc



    _fightData = {}
    # 判断当前位置是否可以修改
    for _state, _posInfo in _embattle.items():
        for pos in _posInfo["pos"]:
            # 如果还没达到这个状态就跳过
            if _state > str(_myState - 1):
                continue

            if _rivaluid != "npc":
                if len(_chkData["rivalpipeidata"]["fightdata"]) >= _posInfo["num"]:
                    continue
                # 当前状态不可修改这个位置
                if pos not in _chkData["rivalpipeidata"]["fightdata"]:
                    _pos = pos
                else:
                    _posList = ["1","2", "3", "4", "5", "6"]
                    _randList = [pos for pos in _posList if pos not in _chkData["rivalpipeidata"]["fightdata"]]
                    if not _randList:
                        continue
                    _pos = g.C.RANDLIST(_randList)[0]
                # 如果是神器
                if _pos == "sqid":
                    _chkData["rivalpipeidata"]["fightdata"][_pos] = "1"
                    break
                for hid, num in _chkData["rivalpipeidata"]["randhid"].items():
                    if num <= _chkData["rivalpipeidata"]["selecthero"].get(hid, 0):
                        continue
                    _chkData["rivalpipeidata"]["fightdata"][_pos] = hid
                    _chkData["rivalpipeidata"]["selecthero"][hid] = _chkData["rivalpipeidata"]["selecthero"].get(hid, 0) + 1
                    break
                _fightData = _chkData["rivalpipeidata"]["fightdata"]
            else:
                _npcFightData = _pipeiData.get("npcfightdata", {})
                _fightData[pos] = _npcFightData.get(pos, _pipeiData["randhid"].keys()[0])
    # 设置帮助玩家设置的阵容数据
    if _rivaluid != "npc":
        g.m.gongpingjjcfun.setPipeiData(_rivaluid, {"fightdata": _chkData["rivalpipeidata"]["fightdata"], "selecthero": _chkData["rivalpipeidata"]["selecthero"], "state": _myState})

        # 获取对方玩家的匹配数据
        _rivalPipeiData = _chkData["rivalpipeidata"]
        # 推送数据表示已经完成
        _sendData = {"uid": _rivaluid, "state": _myState, "info": {"fightdata": _fightData}}
        g.m.gongpingjjcfun.emitEvent(_rivalPipeiData["sid"], "gpjjc_autoembattle", _sendData)


    # 设置跨服缓存数据表示已经准备好了
    _ckey = "gpjjc_state_{}_{}".format(_myState, _pipeiData["uuid"])
    _finishuid = g.crossMC.get(_ckey) or []

    if _rivaluid not in _finishuid:
        _finishuid.append(_rivaluid)

        # 设置缓存数量
        g.crossMC.set(_ckey, _finishuid, time=180)
        # 表示双方在这个阶段都准备好了
        if len(_finishuid) >= 2:

            g.m.gongpingjjcfun.emitEventFinish(_finishuid, _myState)

    _resData["fightdata"] = _fightData

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    # g.crossMC.flush_all()
    # g.debugConn.uid = g.buid('ysr1')
    # print g.debugConn.uid
    # _data = ['npc']
    # print doproc(g.debugConn,_data)
    g.m.gongpingjjcfun.emitEventFinish(["0_5ea2b6359dc6d633c953dd72", "npc"], 5)