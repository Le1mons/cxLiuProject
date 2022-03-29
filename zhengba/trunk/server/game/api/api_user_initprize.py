#!/usr/bin/python
# coding:utf-8
'''
初始奖励
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
    # 只有一级可以领取
    if gud['lv'] != 1:
        _res['s'] = -1
        _res['errmsg'] = g.L("global_limitlv")
        return _res

    # 已领取
    if gud.get('init', 0):
        _res["s"] = -2
        _res["errmsg"] = g.L('global_algetprize')
        return _res

    g.m.userfun.updateUserInfo(uid, {'init': 1})

    _prize = g.GC['userinfo']['initprize']
    _prizeRes = g.getPrizeRes(uid, _prize, act={"act": "user_initprize"})
    g.sendChangeInfo(conn, _prizeRes)
    _res['d'] = {'prize': _prize}
    return _res


if __name__ == "__main__":
    # 测试vip等级上升后，viplvchange事件是否正确
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [2])