#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
领取跨服争霸积分赛每日奖励
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _con = g.m.crosszbfun.getCon()
    #检查玩家等级是否满足要求
    if not g.chkOpenCond(uid, 'crosszb'):
        _res['s'] = -1
        _res['errmsg'] = g.L("global_limitlv")
        return _res
    
    _idx = int(data[0])
    _prizeCon = g.m.crosszbfun.getCon()['jifen']['dateprize']
    if  _idx < 0 or _idx >= len(_prizeCon):
        #参数信息有误
        _res["s"]=-1
        _res["errmsg"]=g.L('global_argserr')
        return _res
    
    #判断是否在积分赛时间内
    # if not g.m.crosszbfun.isOpenJifen():
    #     _res["s"]=-2
    #     _res["errmsg"]=g.L('crosszb_common_jifentimesup')
    #     return _res

    _recList = g.m.crosszbfun.getJiFenRecPrizeList(uid)
    if _idx in _recList:
        #奖励已领取
        _res["s"]=-3
        _res["errmsg"]=g.L('crosszb_jifen_recdataprize_-3')
        return _res
    
    _needWin = _prizeCon[_idx][0]
    _myWin = g.m.crosszbfun.getJiFenWinNum(uid)
    if _myWin <_needWin:
        #胜场不足，无法领取奖励
        _res["s"]=-4
        _res["errmsg"]=g.L('crosszb_jifen_recdataprize_-4')
        return _res
    
    # 记录奖励领取
    _recList = g.m.crosszbfun.setJiFenRecPrizeList(uid,_idx)
    _prize = _prizeCon[_idx][1]
    _prizeRes = g.getPrizeRes(uid,_prize,act={"act":"crosszb_jifen_dateprize","prize":_prize})
    g.sendChangeInfo(conn,_prizeRes)
    _resData = {}
    #当日领取奖励信息
    _resData['reclist'] = _recList
    _resData['scjl'] = g.m.hongdianfun.getCanSCJJ(uid) #是否可以领奖
    _res['d'] = _resData
    return _res
    
    
if __name__ == "__main__":
    #测试vip等级上升后，viplvchange事件是否正确
    uid = g.buid("ys1")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, [2])
    print g.m.crosszbfun.getQMKey()