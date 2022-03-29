#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
无尽塔防-提升层数layer
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _layer = int(data[0])
    _chk = data[1]
    _avgdps = int(data[2])

    # 判断是否开启
    if not g.chkOpenCond(uid, 'wujinzhita'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 判断层数信息是否正常
    _userData = g.m.wujinzhitafun.getUserData(uid)
    if _layer not in [_userData["layer"] + 1, 0]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 判断时间
    _week = g.C.WEEK()
    _hour = g.C.HOUR()
    if (_week == 0 and _hour >= 22) or (_week == 1 and _hour < 10):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 检测伤害是否异常
    if _avgdps > 232:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_dataerr')
        return _chkData

    # 检测等级是否异常
    if _chk and 'mapdata' in _chk:
        for _, dict in _chk['mapdata'].items():
            _heroInfo = g.m.herofun.getHeroInfo(uid, dict['tid'], keys='star')
            if dict['lv'] > _heroInfo['star']:
                _chkData['s'] = -4
                _chkData['errmsg'] = g.L('global_dataerr')
                return _chkData

    # # 判断是否可以通关
    # if _chk and "mapdata" in _chk:
    #     _tidList = [dict["tid"] for id, dict in _chk["mapdata"].items() if dict]
    #     _maxHero = g.mdb.find1("hero", {"_id": {"$in":map(g.mdb.toObjectId, _tidList)}, "uid":uid}, sort=[["star",-1]],fields=["_id", "star"]) or {}
    #     _maxStar = str(_maxHero.get("star", 5))
    #     _con = g.GC["wujintafang"]
    #     _maxLayer = _con["chk"][_maxStar] if _maxStar in _con["chk"] else _con["chk"]["5"]
    #
    #     # 数据异常
    #     if _layer >= _maxLayer:
    #         _chkData['s'] = -4
    #         _chkData['errmsg'] = g.L('global_dataerr')
    #         return _chkData


    _chkData["userdata"] = _userData
    _chkData["chk"] = _chk
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

    _layer = int(data[0])
    _chk = data[1]

    _userData = _chkData["userdata"]

    _con = g.GC["wujintafang"]
    # 如果是0的话
    if _layer == 0:
        _layer = _userData.get("starlayer", 0)
        g.m.wujinzhitafun.setUserData(uid, {"layer": _layer})
        _chkData = g.m.wujinzhitafun.getInitChk(_layer)
        g.m.wujinzhitafun.setChkData(uid, _chkData)
    else:
        _setData = {}
        _setData["layer"] = _layer
        if _layer > _userData["maxlayer"]:
            _setData["maxlayer"] = _layer
        g.m.wujinzhitafun.setUserData(uid, _setData)
        # 设置检测数据
        g.m.wujinzhitafun.setChkData(uid, _chkData["chk"])

    _resData["myinfo"] = g.m.wujinzhitafun.getUserData(uid)
    # 地图信息
    _resData["mapinfo"] = g.m.wujinzhitafun.getChkData(uid)
    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('lsq0')
    from pprint import pprint

    _data = ['0', {}]
    # pprint (doproc(g.debugConn,_data))

    a = g.GC['hero']['11011']
    pprint(a)