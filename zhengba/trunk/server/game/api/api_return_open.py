#!/usr/bin/python
# coding:utf-8
'''
王者归来 - 主界面
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

        {"d": {'daily': 今日充值,
                'login': 登陆次数,
                'recharge': 累计充值,
                'v': 过期时间,
                'receive':{
                    'return': 回归奖励是否领取,
                    'login': [已领取的奖励下标],
                    'daily': [每日充值已领取的下标],
                    'recharge': [累计充值下标]
                }}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _kingData = g.m.userfun.getKingsRerurnData(uid)
    # 已经过期了
    if _kingData['v'] < g.C.NOW():
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _chkData['data'] = _kingData
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = _chkData['data']
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])