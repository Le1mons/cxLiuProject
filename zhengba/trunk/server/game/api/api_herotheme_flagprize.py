#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 战旗领奖
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

    _id = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(80, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData


    _con = g.m.herothemefun.getCon()
    _flagPrize = _con['flagprize'][_id]
    _data = g.m.herothemefun.getData(uid, _hd['hdid'])

    _lv = int(_data["flag"]["exp"] / _con["upflagexp"]) + 1

    # 判断是否可以领奖
    if _lv < int(_id):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    _prize = []
    # 判断是否有奖励需要领取
    if _id not in _data["flag"]["free"]:
        _prize.extend(_flagPrize["freeprize"])
        _data["flag"]["free"].append(_id)
    if _data["flag"]["buy"] and _id not in _data["flag"]["pay"]:
        _prize.extend(_flagPrize["payprize"])
        _data["flag"]["pay"].append(_id)
    # 判断没有奖励可以领取
    if not _prize:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData



    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData["prize"] = _prize

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _id = str(data[0])

    _con = g.m.herothemefun.getCon()


    _data = _chkData['data']
    _prize = _chkData["prize"]

    _setData = {}
    _setData["flag"] = _data["flag"]

    # 设置任务领奖
    g.m.herothemefun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'herotheme_flagprize', 'id': _id})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])