#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 一键战旗领奖
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
    
    _key = str(data[0])
  
    _con = g.m.stagefundfun.getCon(_key)
    _flagPrize = _con['flagprize']
    _data = g.m.stagefundfun.getData(uid, _key)

    _lv = int(_data["exp"] / _con["upflagexp"])

    _prize = []
    for id in xrange(1, _lv + 1):
        if str(id) not in _flagPrize:
            continue

        if str(id) not in _data["free"]:
            _prize.extend(_flagPrize[str(id)]["freeprize"])
            _data["free"].append(str(id))
        if _data["buy"] and str(id) not in _data["pay"]:
            _prize.extend(_flagPrize[str(id)]["payprize"])
            _data["pay"].append(str(id))

    if not _prize:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData


    _chkData['data'] = _data
    _chkData["prize"] = _prize

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _key = str(data[0])
    _con = g.m.stagefundfun.getCon(_key)


    _data = _chkData['data']
    _prize = _chkData["prize"]


    _setData = {}
    _setData["free"] = _data["free"]
    _setData["pay"] = _data["pay"]

    # 设置任务领奖
    g.m.stagefundfun.setData(uid, _key, _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'stagefund_flagallprize'})
    g.sendChangeInfo(conn, _send)

    _data["prize"] = _prize

    _res['d'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['syzc'])