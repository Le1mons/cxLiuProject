#!/usr/bin/env python
#coding:utf-8

'''
    王者雕像 - 送花
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

    # 今天已经送过花了
    if g.getAttrByDate(uid,{'ctype':'kingstatue_gift'},fields={'_id':1,'lasttime':1}):
        _res['s'] = -3
        _res['errmsg'] = g.L('wzstatue_gift_-3')
        return _res

    g.setAttr(uid, {'ctype':'kingstatue_gift'}, {'v': 1})
    _con = g.GC['crosswz']
    _key = g.C.getWeekNumByTime(g.C.NOW())
    # 给王者送花
    g.setAttr(_statue['uid'], {'ctype': 'kingstatue_flower'}, {'$inc': {'v': g.C.RANDINT(*_con['numrange'])},'$set':{'k':_key}})
    _prize = g.m.tanxianfun.getGuaJiPrize(uid, _con['gifttime'], 1)
    _prize = g.m.tanxianfun.getXSHDprize(_prize, _con['gifttime'])
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'wzstatue_gift'})
    g.sendChangeInfo(conn,_prizeRes)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('pjy1')
    print doproc(g.debugConn,['2100_58194944fc40d841bf1033ff', '1'])