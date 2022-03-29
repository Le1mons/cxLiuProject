#!/usr/bin/env python
#coding:utf-8

'''
        巅峰王者 - 用户详情接口
'''

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    _touid = str(data[0])

    # 本周活动未开启
    _ifopen = g.m.crosswzfun.isWangZheOpen()
    if not _ifopen:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    _dkey = g.m.crosswzfun.getDKey()
    _r = g.crossDB.find("userdata", {"uid": _touid}, fields=['_id', 'info'])
    if len(_r) == 0:
        _res['s'] = -2
        _res['errmsg'] = g.L("crosswz_usernotexists")
        return _res

    _r = _r[0]
    _rData = _r['info']
    # 阵容信息
    _hero = []
    herodata = g.crossDB.find("wzbaoming", {"uid": _touid, 'dkey': _dkey}, fields=['_id', 'herodata'])
    if herodata:
        herodata = herodata[0]
        _hero = herodata['herodata']
    _heroData = []
    for h in _hero:
        _heroInfo = {}
        for e in h:
            if 'sqid' in e:
                _heroInfo['sqid'] = e['sqid']
            else:
                _heroInfo[str(e['pos'])] = e
        _heroData.append(_heroInfo)

    _rData['fightdata'] = _heroData

    _res["d"] = _rData
    return (_res)
