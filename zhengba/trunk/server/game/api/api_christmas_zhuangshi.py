#!/usr/bin/python
# coding:utf-8
'''
圣诞活动 - 装饰圣诞树
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
    if not _hd or 'hdid' not in _hd and g.C.NOW() > _hd['etime'] - 24 * 3600:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    # 无可装饰的礼物
    _myData = g.m.christmasfun.getData(uid, _hd['hdid'])
    _con = g.m.christmasfun.getCon()
    _toget = []
    for taskid, val in _myData['liwu']['data'].items():
        if taskid not in _myData['liwu']['rec'] and val >= _con['liwu'][taskid]['pval']:
            _toget.append(taskid)
    if not _toget:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('christmas_1')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['mydata'] = _myData
    _chkData['toget'] = _toget
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _hdid = _chkData['hdid']
    _myData = _chkData['mydata']
    _toget = _chkData['toget']

    _prize = []
    _con = g.m.christmasfun.getCon()
    for i in _toget:
        _prize.extend(_con['liwu'][i]['prize'])

    _myData['liwu']['rec'] += _toget

    g.m.christmasfun.setData(uid, _hdid, {'liwu': _myData['liwu']})
    _send = g.getPrizeRes(uid, _prize, {'act': 'christmas_liwufinish'})
    g.sendUidChangeInfo(uid, _send)

    _res['d'] = {
        "myinfo": _myData,
        "prize": _prize
    }

    return _res


if __name__ == '__main__':
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint(doproc(g.debugConn, data=[]))
