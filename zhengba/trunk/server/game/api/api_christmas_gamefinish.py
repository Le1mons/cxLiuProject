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
    _record = int(data[0])

    _hd = g.m.huodongfun.getHDinfoByHtype(81, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd and g.C.NOW() > _hd['etime'] - 24 * 3600:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    # 数据异常
    if _record <= 0:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_dataerr')
        return _chkData

    # 当天已领取过奖励
    _myinfo = g.m.christmasfun.getData(uid, _hd['hdid'])
    _con = g.m.christmasfun.getCon()
    _prize = []
    if _myinfo['gamenum'] >= _con['gamenum']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _prize = _con['gameprize']

    _chkData['hdid'] = _hd['hdid']
    _chkData['prize'] = _prize
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _hdid = _chkData['hdid']
    _prize = _chkData['prize']

    _record = int(data[0])

    _myinfo = g.m.christmasfun.getData(uid, _hdid)
    _myinfo['gamerecord'] = min(_record, _myinfo['gamerecord']) if _myinfo['gamerecord'] > 0 else _record
    _myinfo['gamenum'] += 1
    g.m.christmasfun.setData(uid, _hdid, _myinfo)
    if _prize:
        _send = g.getPrizeRes(uid, _prize, {'act': 'christmas_gamefinish'})
        g.sendUidChangeInfo(uid, _send)

    _rankList = g.m.christmasfun.getRankList(_hdid, _myinfo, uid)

    _res['d'] = {
        "myinfo": _myinfo,
        "prize": _prize,
        'ranklist': _rankList['ranklist'],
        'myrank': _rankList['myrank'],
        'myval': _rankList['myval']
    }

    return _res

if __name__ == '__main__':
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint(doproc(g.debugConn, data=[50]))
