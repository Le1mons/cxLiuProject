#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
'''
法师塔 - 领取奖励
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 关卡数
    _fashitaId = int(data[0])
    _fashitaInfo = g.m.fashitafun.getFashitaInfo(uid)
    # 玩家法师塔信息不存在
    if not _fashitaInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('fashita_getprize_res_-1')
        return _res

    _layernum = _fashitaInfo.get('layernum', 0)
    # 还没打通
    if _fashitaId > _layernum:
        _res['s'] = -2
        _res['errmsg'] = g.L('fashita_fight_res_-2')
        return _res

    _prizeList = _fashitaInfo['prizelist']

    # 已领取奖励
    if _fashitaId in _prizeList:
        _res['s'] = -3
        _res['errmsg'] = g.L('fashita_fight_res_-3')
        return _res

    _prize = [i[1] for i in g.GC['fashitacom']['passprize'] if i[0] == _fashitaId]

    _sendData = g.getPrizeRes(uid, _prize[0],{'act':'fashita_getprize','layer': _fashitaId})
    g.sendChangeInfo(conn, _sendData)

    _prizeList.append(_fashitaId)
    g.m.fashitafun.updateFashitaInfo(uid, {'prizelist': _prizeList})

    _res['d'] = {'prize': _prize[0]}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['20'])