#!/usr/bin/python
# coding:utf-8
'''
试炼活动 - 主界面
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

        {"d": {'task':{任务id: 当前值}, 'receive': [以领取奖励的任务id]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 只有这个时间戳之后的区才有
    if g.getOpenTime() < g.GC['timestamp']['trial']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 开区天数
    _day = g.getOpenDay()
    _con = g.m.trialfun.getCon()
    _type = ''
    for i in _con:
        if _con[i]['day'][0] <= _day <= _con[i]['day'][1]:
            _type = i
            break
    else:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _chkData['type'] = _type
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _type = _chkData['type']
    _res['d'] = g.m.trialfun.getDataByType(uid, _type)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])