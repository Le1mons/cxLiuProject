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
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'d':{
            'king_uid': 王者uid,
            'groupid':那一组,
            'deep':哪一场比赛,
            'season':赛季,
            'num':花数,
            'reclist':已领取列表,
            'gift':今日能送否
        }
        's': 1}

    """
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
    _rData['reclist'] = _flower.get('reclist', [])
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
        _rData['num'] += _addNum
        g.setAttr(_statue['uid'], {'ctype': 'kingstatue_flower'},
                  {'$set': {'k': _key, 'time': _preTime,'v':_rData['num'],'reclist':_rData['reclist']}})

    # 今日是否能送花
    _rData['gift'] = 0 if g.getAttrByDate(uid,{'ctype':'kingstatue_gift'},fields={'_id':1,'lasttime':1}) else 1

    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    # _nt = g.C.NOW()
    # _preTime = g.C.getWeekFirstDay(_nt)
    # _addNum = 0
    # # 鲜花自增长
    # while _nt - _preTime >= 240:
    #     _preTime += g.C.RANDINT(*[500,700])
    #     _addNum += g.C.RANDINT(*[4,8])
    # print(_addNum)
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xuzhao')
    # print doproc(g.debugConn,['2100_58194944fc40d841bf1033ff', '1'])
    print g.C.getDateDiff(g.C.NOW(), g.C.NOW()+24*3600)