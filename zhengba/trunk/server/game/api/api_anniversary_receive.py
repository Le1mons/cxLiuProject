#!/usr/bin/python
# coding:utf-8
'''
周年庆 - 领奖
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

        {"d": {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 等级不符
    if not g.chkOpenCond(uid, 'anniversary'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = g.m.anniversaryfun.getCon()
    _myData = g.m.anniversaryfun.getData(uid, _hd['hdid'])
    # 奖励已领取
    if _myData.get('sign', 0) >= len(_con['sign']):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _day = g.m.anniversaryfun.getDay(_hd)
    # 还没到领取时间
    if _day <= _myData.get('sign', 0):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _prize = list(_con['sign'][_myData.get('sign', 0)]['prize'])

    # 要先选奖励
    if _con['sign'][_myData.get('sign', 0)]['choose']:
        if str(_myData.get('sign', 0)) not in _myData.get('choose', {}):
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('anniversary_receive_-5')
            return _chkData
        _prize.append(_con['sign'][_myData.get('sign', 0)]['choose'][_myData['choose'][str(_myData['sign'])]])
        # 加上自选奖励
        _prize = g.fmtPrizeList(_prize)


    if not _prize:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _chkData['data'] = _myData
    _chkData['hd'] = _hd
    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _con
    _chkData['prize'] = g.fmtPrizeList(_prize)
    _chkData['day'] = _day
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _myData = _chkData['data']
    _con = _chkData['con']
    _prize = _chkData['prize']

    g.m.anniversaryfun.setData(uid, {'sign': _myData.get('sign', 0) + 1}, _chkData['hdid'])
    _send = g.getPrizeRes(uid, _prize, {'act':'anniversary_receive','day':_chkData['day']})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': g.m.anniversaryfun.getData(uid, _chkData['hdid'])}
    _res['d']['day'] = g.m.anniversaryfun.getDay(_chkData['hd'])
    _res['d']['data']['signreceive'] = _res['d']['day'] > _res['d']['data']['sign'] and _res['d']['data']['sign'] < len(g.m.anniversaryfun.getCon()['sign'])
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])