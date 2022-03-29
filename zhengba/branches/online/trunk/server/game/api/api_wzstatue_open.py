#!/usr/bin/env python
#coding:utf-8

'''
    王者雕像 - 主界面
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s' : 1}
    uid = conn.uid
    _statue = g.m.crosswzfun.getKingStatueInfo()
    _rData = {}
    # 没有雕像信息
    if 'uid' not in _statue:
        _res['s'] = -1
        _res['errmsg'] = g.L('wzstatue_open_-1')
        return _res

    _nt = g.C.NOW()
    _key = g.C.getWeekNumByTime(_nt)
    _flower = g.getAttrOne(_statue['uid'], {'ctype': 'kingstatue_flower', 'k': _key},
                           keys='_id,v,reclist,time') or {}

    _rData['king_uid'] = _statue['uid']
    _rData['groupid'] = _statue['groupid']
    _rData['deep'] = _statue['deep']
    _rData['season'] = g.crossDB.count('wzquarterwinner')
    _rData['num'] = _flower.get('v', 0)
    # 如果是王者本人
    # if _statue['uid'] == uid:
    _con = g.GC['crosswz']
    _preTime = _flower.get('time', g.C.getWeekFirstDay(_nt))
    _addNum = 0
    # 鲜花自增长
    while _nt - _preTime >= _con['timerange'][0]:
        _preTime += g.C.RANDINT(*_con['timerange'])
        _addNum += g.C.RANDINT(*_con['numrange'])

    if _addNum:
        g.setAttr(uid, {'ctype': 'kingstatue_flower'},
                  {'$set': {'k': _key, 'time': _preTime}, '$inc': {'v': _addNum}})

    _rData['num'] += _addNum
    _rData['reclist'] = _flower.get('reclist', [])
    # 今日是否能送花
    _rData['gift'] = 0 if g.getAttrByDate(uid,{'ctype':'kingstatue_gift'},fields={'_id':1,'lasttime':1}) else 1

    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn,['2100_58194944fc40d841bf1033ff', '1'])