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
    :param data: [奖励的索引:int, 选择的索引:int]
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

    _pidx = abs(int(data[0]))
    _cidx = abs(int(data[1]))
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

    _con = g.m.anniversaryfun.getCon()['sign']
    if not _con[_pidx]['choose'] or _cidx >= len(_con[_pidx]['choose']):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _myData = g.m.anniversaryfun.getData(uid, _hd['hdid'])
    # 奖励已领取
    if _myData['sign'] > _pidx:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.m.anniversaryfun.setData(uid, {'choose.{}'.format(data[0]): data[1]}, _chkData['hdid'])
    _res['d'] = g.m.anniversaryfun.getData(uid, _chkData['hdid'])
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2,0])