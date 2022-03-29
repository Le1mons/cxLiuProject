#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-open
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    # # 获取公平竞技场是否开启
    # _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    # if not _chkOpen["act"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData


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

    # 匹配数据
    _resData["pipeiinfo"] = g.m.gongpingjjcfun.getPipeiData(uid, keys="_id")
    # 如果匹配数据存在需要查询对方数据
    if _resData["pipeiinfo"]:
        # 判断现在是否需要进入战斗
        if _resData["pipeiinfo"]["state"] == 5:
            _fightRes = g.crossMC.get('gpjjc_fight_{}'.format(_resData["pipeiinfo"]["uuid"]))
            _resData["pipeiinfo"]["isfight"] = 0
            if _fightRes:
                _resData["pipeiinfo"]["isfight"] = 1
            else:
                _nt = g.C.NOW()
                # 如果没有战斗数据且，这一轮匹配时长超过40秒，就直接删掉数据弹出界面
                if _resData["pipeiinfo"]["stime"] + 39 < _nt:
                    # 删除匹配数据
                    _season = g.m.gongpingjjcfun.getSeason()
                    g.crossDB.delete("gpjjc_pipei", {"uid": uid, "season": _season})
                    _res['s'] = -205
                    _res['errmsg'] = g.L('gpjjc_pipei_res_-205')
                    return _res


        if _resData["pipeiinfo"]["rivaluid"] != "npc":
            _resData["rivalpipeiinfo"] = g.m.gongpingjjcfun.getPipeiData(_resData["pipeiinfo"]["rivaluid"], keys="fightdata,headdata,_id")
        else:
            _resData["rivalpipeiinfo"] = {}
            _fightData = {}
            _con = g.GC["gongpingjjc"]
            _embattle = _con["embattle"]
            for _state, _posInfo in _embattle.items():
                for pos in _posInfo["pos"]:
                    # 如果还没达到这个状态就跳过
                    if _state > str(_resData["pipeiinfo"]["state"] - 1):
                        continue
                    _npcFightData = _resData["pipeiinfo"]["npcfightdata"].get("npcfightdata", {})
                    _fightData[pos] = _npcFightData.get(pos, _resData["pipeiinfo"]["randhid"].keys()[0])

            _resData["rivalpipeiinfo"]["fightdata"] = _fightData
            _resData["rivalpipeiinfo"]["headdata"] = _resData["pipeiinfo"]["npchead"]

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('ysr1')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dff']
    print doproc(g.debugConn,_data)