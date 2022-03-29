#!/usr/bin/python
# coding:utf-8
'''
三周年 - 关卡战斗
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(77,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    # 关卡下标
    _idx = int(data[0])
    _fightData = data[1]

    _con = g.m.zhounian3fun.getCon()
    _fightNum = _con["fightnum"]
    _guankaCon = _con["guanka"][_idx]
    _guankaOpen = _con["guankaopen"]
    # 判断篇章是否开启
    _nt = g.C.NOW()
    _stime = _hd["stime"]
    _openDay = g.C.getTimeDiff(_nt, _stime) + 1
    if _openDay < _guankaOpen[str(_guankaCon["page"])]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    # 判断上阵英雄数据是否异常
    _hidList = _fightData.values()
    _chkDict = {}
    for hid in _hidList:
        if _chkDict.get(hid, 0) >= _guankaCon["hero"].get(hid,{}).get("num", 0):
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData
        _chkDict[hid] = _chkDict.get(hid, 0) + 1

    # # 判断今天是否有挑战次数
    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='guankarec')
    if _data["guankarec"]["fightnum"] >= _fightNum:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gonghuifuben_fight_res_-4')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 关卡下标
    _idx = int(data[0])
    _fightData = data[1]



    _con = g.m.zhounian3fun.getCon()
    _hdid = _chkData['hdid']
    _data = _chkData["data"]
    _guankaCon = _con["guanka"][_idx]


    _userFightData = []
    for pos, hid in _fightData.items():
        _herodata = _guankaCon["hero"][hid]
        # 获取当前装备的buff
        _herodata["buff"] = _guankaCon["buff"]
        # 获取英雄数据
        _heroInfo = g.m.zhounian3fun.makeHeroBuff(_herodata)
        _heroInfo["pos"] = int(pos)
        _heroInfo["side"] = 0
        _fight = g.m.fightfun.fmtFightData(_heroInfo)

        _userFightData.append(_fight)

    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_guankaCon["npcid"])
    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    _winside = _fightRes['winside']
    _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _bossFightData['headdata']]
    _resData = {}
    _resData['fightres'] = _fightRes
    # 判断是否胜利
    if _winside == 0:
        # 如果曾经没通关
        if _idx not in _data["guankarec"]["win"]:
            _data["guankarec"]["win"].append(_idx)
        else:
            _data["guankarec"]["fightnum"] = _data["guankarec"]["fightnum"] + 1
        # 设置数据
        g.m.zhounian3fun.setData(uid, _chkData['hdid'], {"guankarec": _data["guankarec"]})

        _prize = _guankaCon["prize"]
        _resData["prize"] = _prize

        _sendData = g.getPrizeRes(uid, _prize, {'act':'zhounian3_fight', 'idx': _idx})
        g.sendChangeInfo(conn, _sendData)
    g.event.emit('zhounian3', uid, "3")
    _resData["myinfo"] = g.m.zhounian3fun.getData(uid, _hdid, keys='guankarec,task')
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1', {1:"55036",2:"61036", 3:"32056", 4:"32076", 5:"45046", 6:"41076"}])