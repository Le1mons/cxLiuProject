#!/usr/bin/python
# coding: utf-8
'''
探险——领取阶段奖励
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 奖励的索引
    _idx = int(data[0])
    if _idx < 0 or _idx >= len(g.GC['tanxiancom']['base']['passprize']):
        #奖励信息有误
        _res['s'] = -1
        _res['errmsg'] = g.L('tanxian_recpassprize_-1')
        return _res
    
    #已领取的下标
    _recIdxList = g.m.tanxianfun.getPassPrizeIdx(uid)
    _con = g.GC['tanxiancom']['base']['passprize']
    if _idx in _recIdxList:
        #奖励已领取完毕
        _res['s'] = -2
        _res['errmsg'] = g.L('tanxian_recpassprize_-2')
        return _res
    
    gud = g.getGud(uid)
    _chkCon = _con[_idx]
    if gud['maxmapid'] <= _chkCon[0]:
        #条件未达成
        _res['s'] = -3
        _res['errmsg'] = g.L('tanxian_recpassprize_-3')
        return _res
    
    #设置领取信息
    _recIdxList.append(_idx)
    g.m.tanxianfun.setPassPrizeIdx(uid,_recIdxList)
    _prize = list(_chkCon[1])
    #获取奖励
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'tanxian_recpassprize'})
    _r = g.sendChangeInfo(conn,_prizeRes)
    _resData = {}
    _resData['prize'] = _prize
    _resData['passprizeidx'] = _recIdxList
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("tk1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0])
