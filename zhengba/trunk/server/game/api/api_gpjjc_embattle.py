#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-布阵
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1
    # 上阵的英雄数据

    _fightData = data[0]

    # 获取玩家匹配数据
    _pipeiData = g.m.gongpingjjcfun.getPipeiData(uid, keys="_id,fightdata,selecthero,state,randhid,rivaluid,sid,uuid,ctime")

    # 判断是否已经开始匹配
    if not _pipeiData:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_state_res_-1')
        return _chkData

    # 获取
    _state = _pipeiData["state"]
    # 加锁对uid加锁
    _ckey = "gpjjc_embattle_{}".format(uid)

    _lock = g.crossMC.set(_ckey,1, time=3)

    _con = g.GC["gongpingjjc"]
    _embattle = _con["embattle"]
    # 当前状态不可做此操作
    if str(_state) not in _embattle:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gpjjc_embattle_res_-1')
        return _chkData
    # 如果上阵大于这个数量
    if len(_fightData) > len(_embattle[str(_state)]["pos"]):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gpjjc_embattle_res_-2')
        return _chkData

    # 判断当前位置是否可以修改
    for pos, hid in _fightData.items():
        if pos == "sqid":
            _pipeiData["fightdata"][pos] = hid
            continue
        # 判断位置是否已经上阵
        if pos in _pipeiData["fightdata"]:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('gpjjc_embattle_res_-3')
            return _chkData

        # 超过英雄上阵的数量
        if _pipeiData["selecthero"].get(hid, 0) >= _pipeiData["randhid"].get(hid, 0):
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('gpjjc_embattle_res_-4')
            return _chkData
        # 增加数量
        _pipeiData["selecthero"][hid] = _pipeiData["selecthero"].get(hid, 0) + 1
        _pipeiData["fightdata"][pos] = hid

    _chkData["pipeidata"] = _pipeiData
    _chkData["state"] = _state

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

    # 获取匹配数据
    _pipeiData = _chkData["pipeidata"]
    _state = _chkData["state"]

    # 获取玩家数据
    _myinfo = _pipeiData
    g.m.gongpingjjcfun.setPipeiData(uid, {"fightdata": _pipeiData["fightdata"], "selecthero": _pipeiData["selecthero"], "state":_state + 1})

    _pipeiData["state"] = _state + 1

    # 如果不是npc
    if _myinfo["rivaluid"] != "npc":
        # 获取对方玩家的匹配数据
        _rivalPipeiData = g.m.gongpingjjcfun.getPipeiData(_myinfo["rivaluid"],
                                                          keys="_id,state,randhid,rivaluid,sid,uuid,ctime")
        # 推送数据表示已经完成
        _MySendData = {"uid": _myinfo["rivaluid"], "state": _state, "info": {"fightdata": _pipeiData["fightdata"]}}
        g.m.gongpingjjcfun.emitEvent(_rivalPipeiData["sid"], "gpjjc_embattle", _MySendData)


    # 设置跨服缓存数据表示已经准备好了
    _ckey = "gpjjc_state_{}_{}".format(_state + 1, _myinfo["uuid"])
    _finishuid = g.crossMC.get(_ckey) or []
    if uid not in _finishuid:
        _finishuid.append(uid)

        # 设置缓存数量
        g.crossMC.set(_ckey, _finishuid, time=180)
        # 表示双方在这个阶段都准备好了
        if len(_finishuid) >= 2:
            # 通知双方可以进入下一步
            g.m.gongpingjjcfun.emitEventFinish(_finishuid, _state + 1)

    # 如果是状态5则会判断是否进入战斗
    if _pipeiData["state"] == 5:
        _fightRes = g.crossMC.get('gpjjc_fight_{}'.format(_pipeiData["uuid"]))
        _pipeiData["isfight"] = 0
        if _fightRes:
            _pipeiData["isfight"] = 1
        else:
            _nt = g.C.NOW()
            # 如果没有战斗数据且，这一轮匹配时长超过40秒，就直接删掉数据弹出界面
            if _pipeiData["stime"] + 39 < _nt:
                # 删除匹配数据
                _season = g.m.gongpingjjcfun.getSeason()
                g.crossDB.delete("gpjjc_pipei", {"uid": uid, "season": _season})
                _res['s'] = -205
                _res['errmsg'] = g.L('gpjjc_pipei_res_-205')
                return _res

    _resData["pipeiinfo"] = _pipeiData
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xiaoxiannv')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dff']
    _con = g.GC["gongpingjjc"]
    print g.C.RANDLIST(_con["defaultembattle"])