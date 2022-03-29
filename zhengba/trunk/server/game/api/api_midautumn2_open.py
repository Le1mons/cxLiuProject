#!/usr/bin/python
# coding:utf-8
'''
中秋节2 - 主界面
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

    _hd = g.m.huodongfun.getHDinfoByHtype(78, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _myinfo = g.m.midautumn2fun.getData(uid, _chkData['hdid'])

    # 奖池开奖记录
    _log = {}
    _pool = g.m.crosscomfun.getGameConfig({'ctype': "TIMER_MIDAUTUMN2_SENDPRIZE", "k": _chkData['hdid']})
    if _pool:
        _log = _pool[0]["v"]
    # 投票日志
    _ctype2 = "midautumn2_lotterylog"


    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _chkData['hdid']})
    _loglist = []
    if _conData:
        _loglist = _conData[0]["v"]


    _res['d'] = {
        "myinfo":_myinfo,
        "lotterynum":g.m.midautumn2fun.getLotteryNum(_chkData['hdid']),
        "rank":g.m.midautumn2fun.getRankList(_chkData['hdid'], _myinfo, uid),
        "lotterylog":_log,
        "log":_loglist
    }

    return _res

if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=['1', 1]))
