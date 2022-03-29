#!/usr/bin/env python
#coding:utf-8

'''
    王者雕像 - 查看鲜花领取信息
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
    # 要领取的数量
    _num = int(data[0])
    _con = g.GC['crosswz']['num2prize']
    # 参数不对
    if str(_num) not in _con:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _statue = g.m.crosswzfun.getKingStatueInfo()
    # 没有雕像信息
    if 'uid' not in _statue:
        _res['s'] = -1
        _res['errmsg'] = g.L('wzstatue_open_-1')
        return _res

    # 不是王者
    if _statue['uid'] != uid:
        _res['s'] = -2
        _res['errmsg'] = g.L('wzstatue_flower_-2')
        return _res

    _key = g.C.getWeekNumByTime(g.C.NOW())
    _flower = g.getAttrOne(_statue['uid'], {'ctype':'kingstatue_flower','k':_key}, keys='_id,v,reclist') or {}
    # 数量不足
    if _flower.get('v', 0) <= _num:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_valerr')
        return _res

    # 已经领了
    if _num in _flower.get('reclist', []):
        _res['s'] = -5
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    g.setAttr(uid, {'ctype':'kingstatue_flower'},{'$set':{'k':_key},'$push':{'reclist':_num}})
    _sendData = g.getPrizeRes(uid, _con[str(_num)], {'act':'wzstatue_recprize','num':_num})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _con[str(_num)]}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('Z2')
    print doproc(g.debugConn,[100])