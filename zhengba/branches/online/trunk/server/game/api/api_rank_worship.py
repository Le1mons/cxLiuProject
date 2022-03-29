#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
排行 - 膜拜
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 排行榜索引
    _idx = int(data[0])
    _con = g.GC['rankcom']['base']
    _openRankNum = _con['opennum']
    # 参数错误
    if _idx < 0 or _openRankNum <= _idx:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _ctype = 'rank_worship'
    _worshipInfo = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _worshipInfo:
        _worshiped = []
    else:
        _worshiped = _worshipInfo[0]['v']

    # 已经膜拜过
    if _idx in _worshiped:
        _res['s'] = -1
        _res['errmsg'] = g.L('rank_worship_res_-1')
        return _res

    _worshiped.append(_idx)
    g.setAttr(uid,{'ctype':_ctype},{'v': _worshiped})

    _prize = g.m.rankfun.getWorshipPrize()
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'rank_worship','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[5])