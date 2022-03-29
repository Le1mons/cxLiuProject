#!/usr/bin/python
# coding:utf-8
'''
周年庆 - 重置奖池
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务id:str]
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

    _myData = g.m.anniversaryfun.getData(uid, _hd['hdid'])
    _con = g.m.anniversaryfun.getCon()['prizepool']
    # 越界
    if _myData['pool'] >= len(_con) - 1:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('anniversary_change_-3')
        return _chkData

    for idx, i in enumerate(_con[_myData.get('pool', 0)]):
        if i['core'] == 1:
            break
    else:
        # 没有核心装备
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 核心奖励还没获取到
    if _myData['prizepool'].get(str(idx), 0) < i['num']:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['pool'] = _myData['pool'] + 1
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.m.anniversaryfun.setData(uid, {'pool': _chkData['pool']}, _chkData['hdid'])
    _res['d'] = g.m.anniversaryfun.getData(uid, _chkData['hdid'])
    return _res

if __name__ == '__main__':
    uid = g.buid("test88")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=[10])
    _prize = [{'a':'equip','t':i,'n':1} for i in g.GC['equip']]
    g.getPrizeRes(uid, _prize)