#!/usr/bin/python
#coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
积分赛领取排行奖励
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    

def doproc(conn,data):
    _res = {"s":1}
    return _res
    
    '''
    uid = conn.uid
    gud = g.getGud(uid)
    _con = g.m.crosszbfun.getCon()
    _nt = g.C.NOW()
    _dkey = str(g.C.getWeekNumByTime(_nt))
    _rankData = g.crossDB.find1('crosszb_jifen',{'uid':uid,'dkey':_dkey})
    #判断是否已经领奖n
    if _rankData == None:
        _res['s'] = -1
        _res['errmsg'] = g.L("crosszb_jfrecrankprize_-1")
        return _res

    if "rankprize" in _rankData:
        _res['s'] = -2
        _res['errmsg'] = g.L("crosszb_jfrecrankprize_-2")
        return _res

    #读取奖励
    _myjifen,_myrank = g.m.crosszbfun.getMyJFRankAndJF(uid)
    _prize = g.m.crosszbfun.getJFRankPrize(_myrank)
    #设置领取奖励
    g.crossDB.update('crosszb_jifen',{'uid':uid,'dkey':_dkey},{'rankprize':_prize})
    _prizeMap = g.getPrizeRes(uid,_prize,{"act":"crosszb_jfbankprize","prize":_prize})
    g.sendChangeInfo(conn,_prizeMap)
    return _res
    '''

if __name__ == "__main__":
    g.debugConn.uid = "0_5760ed8c6a5d091544ac8fd6"
    print doproc(g.debugConn,[])