#!/usr/bin/python
# coding:utf-8
'''
小游戏-open
'''

if __name__ == "__main__":
    import sys

    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {
            'reclist': [以领取的索引]
        },
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _con = g.GC['xiaoyouxi']
    _rData = {}
    _ctype = "xiaoyouxi_jstl"
    for _idx, _v in enumerate(_con):
        _w = {'ctype': _ctype, 'k': str(_idx)}
        _rec = g.getAttrOne(uid, _w, keys="_id,v") or {}
        _rData[str(_idx)] = _rec.get('v', [])

    _resData = {}
    _resData["xiaoyouxi"] = _rData
    _resData["jssl"] = {}
    _resData["jsmz"] = {"act": 0, "stime": g.C.ZERO(g.getOpenTime()) + 7 * 24 * 3600}
    _hdList = g.mdb.find("hdinfo", {"hdid": {"$in": [5201, 5001]}}, fields=["stime", "_id", "etime", "hdid", "data"])
    for hd in _hdList:
        if hd["hdid"] == 5001:
            del hd["data"]
            _resData["jssl"] = hd
        else:
            _hddata = g.m.jugg_lost_52.todayReset(uid, hd)
            _resData["jsmz"]["act"] = g.m.jugg_lost_52.isopen(uid, _hddata, hd)

    _res['d'] = _resData

    return _res


if __name__ == "__main__":
    # 测试vip等级上升后，viplvchange事件是否正确
    # uid = g.buid("xuzhao")
    uid = "0_5e8d955c9dc6d64d2395dcc9"
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])