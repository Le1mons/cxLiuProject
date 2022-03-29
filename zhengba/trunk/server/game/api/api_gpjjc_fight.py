#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-战斗
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

    _season = g.m.gongpingjjcfun.getSeason()
    _pipeiInfo = g.crossDB.find1("gpjjc_pipei", {"uid": uid, "season": _season},
                                 fields=["_id", "sid", "uid", "state", "headdata", "fightdata", "uuid"])

    if not _pipeiInfo:
        _chkData['s'] = -3
        # _chkData['errmsg'] = g.L('gpjjc_state_res_-2')
        return _chkData


    # 如果状态不为5
    if _pipeiInfo["state"] != 5:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gpjjc_embattle_res_-1')
        return _chkData


    _uuid = _pipeiInfo["uuid"]
    _resData = g.crossMC.get('gpjjc_fight_{}'.format(_uuid))

    # 如果状态为5 掉战斗接口不管有没有数据都返回
    if _pipeiInfo["state"] == 5:
        # 删除匹配数据
        g.crossDB.delete("gpjjc_pipei", {"uid": uid, "season": _season})

    # 如果战斗数据不存在
    if not _resData:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('chat_watch_res_-1')
        return _chkData


    _chkData["fightres"] = _resData["fightres"]
    _chkData["prize"] = _resData["prize"]
    _chkData["pipeiinfo"] = _pipeiInfo

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
    _pipeiInfo = _chkData["pipeiinfo"]
    _fightres = _chkData["fightres"]
    _prize = _chkData["prize"]
    # 获取玩家在那边
    _idx = 0
    for idx, head in enumerate(_fightres["headdata"]):
        if head["uid"] == uid:
            _idx = idx
            break

    if _idx == 1:
        # # 格式化战斗数据，把双方阵容换边
        for k, v in _fightres["fightres"].items():
            if v["side"] == 0:
                v["side"] = 1
            else:
                v["side"] = 0

        for k, v in _fightres["roles"].items():
            if v["side"] == 0:
                v["side"] = 1
            else:
                v["side"] = 0
        # 倒叙
        _fightres["headdata"].reverse()
        # 倒叙
        _fightres["dpsbyside"].reverse()
        # 倒叙
        _fightres["zhenfa"].reverse()
        # 倒叙
        _fightres["jifeninfo"].reverse()

        if _fightres["winside"] == 0:
            _fightres["winside"] = 1
        else:
            _fightres["winside"] = 0


    _resData["prize"] = _prize
    _resData["fightres"] = _fightres

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('ysr1')
    print g.debugConn.uid
    _data = ['11096']
    print doproc(g.debugConn,_data)