#!/usr/bin/python
# coding:utf-8
'''
周年庆 - 主界面
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

        {"d": {
            'task': {},         # 任务数据
            'chess': 0          # 骰子所在的索引
            'receive': {},      # 任务领奖记录
            'sign': 0,          # 签到领奖记录
            'prizepool': {},    # 奖池领取记录
            'pool': 0,          # 奖池编号
            'pay':{订单编号: 已购买次数}
        }
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
        _chkData['s'] = 1
        _chkData['d'] = {}
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['hd'] = _hd
    _chkData['rtime'] = _hd['rtime']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = g.m.anniversaryfun.getData(uid, _chkData['hdid'])
    _res['d']['rtime'] = _chkData['rtime']
    _res['d']['day'] = g.m.anniversaryfun.getDay(_chkData['hd'])
    _res['d']['signreceive'] = _res['d']['day'] > _res['d']['sign'] and _res['d']['sign'] < len(g.m.anniversaryfun.getCon()['sign'])
    _res['d']['hdinfo'] = _chkData['hd']
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])