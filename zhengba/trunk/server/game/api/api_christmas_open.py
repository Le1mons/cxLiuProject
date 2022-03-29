#!/usr/bin/python
# coding:utf-8
'''
圣诞活动 - 主界面
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

    _hd = g.m.huodongfun.getHDinfoByHtype(81, "etime")
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

    _hdid = _chkData['hdid']
    _hdinfo = _chkData['hdinfo']

    # 避免跨天时未重登的最后一个任务检测
    g.m.christmasfun.onLoginEvent(uid)

    _myinfo = g.m.christmasfun.getData(uid, _hdid)
    # 检查是否有可领取的奖励
    _myinfo, _prize = g.m.christmasfun.chkPrize(_myinfo, _hdinfo)
    g.m.christmasfun.setData(uid, _hdid, _myinfo)

    if _prize and g.C.NOW() <= _hdinfo['etime'] - 24 * 3600:
        _send = g.getPrizeRes(uid, _prize, {'act': 'christmas_taskfinish'})
        g.sendUidChangeInfo(uid, _send)

    _rankList = g.m.christmasfun.getRankList(_hdid, _myinfo, uid)

    _hdinfo['rtime'] = _hdinfo['etime'] - 24 * 3600
    _hdinfo['day'] = g.C.getDateDiff(_hdinfo['stime'], g.C.NOW()) + 1

    _res['d'] = {
        "myinfo": _myinfo,
        "ranklist": _rankList['ranklist'],
        "myrank": _rankList['myrank'],
        "myval": _rankList['myval'],
        'hdinfo': _hdinfo,
        "prize": _prize
    }

    return _res


if __name__ == '__main__':
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint(doproc(g.debugConn, data=[]))
