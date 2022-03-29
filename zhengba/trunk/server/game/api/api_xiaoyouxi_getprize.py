#!/usr/bin/python
# coding:utf-8
'''
小游戏奖励
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
    _idx = int(data[0])
    _id = int(data[1])
    # 只有一级可以领取
    _con = g.GC["xiaoyouxi"][_idx]['level'][_id]
    _cond = _con["cond"]

    if gud['maxmapid'] < _cond[0]:
        _res['s'] = -1
        _res['errmsg'] = g.L("global_hdnoopen")
        return _res

    _ctype = "xiaoyouxi_jstl"
    _w = {'ctype': _ctype, 'k': str(_idx)}
    _idxdata = g.getAttrOne(uid, _w) or {}
    _rec = _idxdata.get('v', [])
    if _id in _rec:
        _res['s'] = -2
        _res['errmsg'] = g.L("planttrees_res_-2")
        return _res

    _rec.append(_id)
    g.setAttr(uid, _w, {"v": _rec})
    _prize = _con["prize"]
    _prizeRes = g.getPrizeRes(uid, _prize, act={"act": "user_xiaoyouxi", "idx": _idx, "id":_id})
    g.sendChangeInfo(conn, _prizeRes)
    _res['d'] = {'prize': _prize, "rec":_rec}
    return _res


if __name__ == "__main__":
    # 测试vip等级上升后，viplvchange事件是否正确
    uid = g.buid("0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, ["1"])