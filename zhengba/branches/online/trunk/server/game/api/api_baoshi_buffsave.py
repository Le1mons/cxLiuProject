#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
宝石 - 改变属性
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄tid
    _tid = data[0]
    _bsType = '6'
    _buffId = g.getAttrByCtype(uid,'baoshi_buff')
    # buffid不存在
    if not _buffId:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_buffsave_res_-1')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, _tid)
    # yingxiong不存在
    if not _heroInfo:
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _wearData = _heroInfo.get('weardata')
    # 宝石不存在
    if not _wearData:
        _res['s'] = -2
        _res['errmsg'] = g.L('baoshi_buffsave_res_-2')
        return _res

    _lv = _wearData[_bsType].keys()[0]
    _baoshiData = g.m.herofun.setUserWearInfo(uid, _tid, _bsType, {_lv: _buffId})
    _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, ['baoshi'])
    _heroData[_tid].update(_baoshiData)
    g.sendChangeInfo(conn, {'hero': _heroData})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc1548ac0911a1710920989',1])