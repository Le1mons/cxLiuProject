#!/usr/bin/python
# coding:utf-8
'''
中秋节2 - 小游戏奖励领取
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _val = int(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(78, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _myInfo = g.m.midautumn2fun.getData(uid, _hd['hdid'])

    _con = g.m.midautumn2fun.getCon()

    if _myInfo["gamenum"] >= _con["gamenum"]:
        _noPrize = True
    else:
        _noPrize = False

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData['con'] = _con
    _chkData["data"] = _myInfo
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _val = int(data[0])
    _data = _chkData["data"]
    _con = _chkData['con']

    _prize = []
    _gamePrize = g.m.midautumn2fun.getCon()["gameprize"]
    for info in _gamePrize:
        if info["val"][0] <= _val <= info["val"][1]:
            _prize = info["prize"]
            break

    if _data["gamenum"] >= _con["gamenum"]:
        _prize = []

    _setData = {}
    # 只记录最小步数
    if _val < _data["val"] or _data["val"] <= 0:
        _setData["val"] = _data["val"] = _val
    _data["gamenum"] += 1
    _setData["gamenum"] = _data["gamenum"]
    # 设置数据
    g.m.midautumn2fun.setData(uid, _chkData['hdid'], _setData)
    if _prize:
        _send = g.getPrizeRes(uid, _prize, {'act': 'midautumn2_gameprize'})
        g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo": g.m.midautumn2fun.getData(uid, _chkData['hdid']), 'prize': _prize,  "rank":g.m.midautumn2fun.getRankList(_chkData['hdid'], _data, uid)}

    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('1')
    gud = g.getGud(g.debugConn.uid)
    print doproc(g.debugConn,[32])