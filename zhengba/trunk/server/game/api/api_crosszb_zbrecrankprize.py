#!/usr/bin/python
#coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")
import g

'''
获取跨服争霸排名奖励
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    return _res
    # _status = g.m.crosszbfun.getZBStatus()
    # if _status  != 2:
    #     #休战中才能领取奖励
    #     _res['s'] = -4
    #     _res['errmsg'] = g.L("crosszbfun_recrankprize_-4")
    #     return _res
    #
    # _dkey = g.m.crosszbfun.getQMKey()
    # #不加step条件
    # _rankData = g.crossDB.find1('crosszb_zb',{'uid':uid,'dkey':_dkey})
    # if _rankData == None:
    #     #无奖励领取
    #     _res['s'] = -2
    #     _res['errmsg'] = g.L("crosszbfun_recrankprize_-2")
    #     return _res
    #
    # if 'rankprize' in _rankData:
    #     #奖励已领取
    #     _res['s'] = -3
    #     _res['errmsg'] = g.L("crosszbfun_recrankprize_-3")
    #     return _res
    #
    # _prize = g.m.crosszbfun.getCrossZBRankPrizeCon(_rankData['rank'])
    # #设置领取奖励
    # g.crossDB.update('crosszb_zb',{'uid':uid,'dkey':_dkey},{'rankprize':_prize})
    # _prizeMap = g.getPrizeRes(uid,_prize,{"act":"crosszb_rzbankprize","prize":_prize})
    # g.sendChangeInfo(conn,_prizeMap)
    #
    # _res['d'] = {'prize': _prize}
    # return _res

if __name__ == "__main__":
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['NPC'])