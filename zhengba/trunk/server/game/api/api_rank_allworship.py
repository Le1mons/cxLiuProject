#!/usr/bin/python
# coding:utf-8
'''
排行 - 膜拜
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [排行榜索引:int]
    :return:
    ::

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 排行榜索引
    _con = g.GC['rankcom']['base']
    _openRankNum = _con['opennum']

    _ctype = 'rank_worship'
    _worshipInfo = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _worshipInfo:
        _worshiped = []
    else:
        _worshiped = _worshipInfo[0]['v']
    _getIdx = []
    for idx in xrange(_openRankNum + 1):
        if idx not in _worshiped:
            _getIdx.append(idx)
    _prize = []
    for i in _getIdx:
        _prize1 = g.m.rankfun.getWorshipPrize()
        _worshiped.append(i)
        _prize.extend(_prize1)
    g.setAttr(uid, {'ctype': _ctype}, {'v': _worshiped})
    # _prize = g.mergePrize(_prize)
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'rank_allworship', 'prize': _prize, "idx": _getIdx})
    g.sendChangeInfo(conn, _sendData)
    
    # 圣诞活动膜拜任务
    g.event.emit('shengdan', uid, {'task': ['1002']}, len(_getIdx))

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[5])