#!/usr/bin/python
#coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
积分赛购买PK次数接口
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _vip = str(gud['vip'])
    _con = g.m.crosszbfun.getCon()
    _jfstatus = g.m.crosszbfun.getJFStatus()
    if _jfstatus != 1:
        _res['s'] = -2
        _res['errmsg'] = g.L("crosszb_jfbuypknum_-2")
        return _res

    #获取当前购买次数
    _buyNum = g.m.crosszbfun.getJFPKBuyNum(uid)
    _buyNum += 1
    #判断是否会超过最大购买次数,报错
    if _buyNum>_con['fightnum'][_vip]:
        _res['s'] = -1
        _res['errmsg'] = g.L("crosszb_jfbuypknum_-1")
        return _res

    #获取本次购买消耗的钻石
    _need = g.m.crosszbfun.getBuyNeed(_buyNum)
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'baoshi_lvup'})
    g.sendChangeInfo(conn,_sendData)
    #增加购买次数
    g.m.crosszbfun.setJFPKBuyNum(uid)
    #获取剩余可购买次数
    _lessNum = g.m.crosszbfun.getCanJFPkNum(uid)
    #获取下次购买所需钻石
    _buyNeed = g.m.crosszbfun.getBuyNeed(_buyNum+1)
    _maxBuyNum = g.m.crosszbfun.getJFMaxBuyNum(uid)
    _lessBuyNum = _maxBuyNum - _buyNum if (_maxBuyNum - _buyNum)>0 else 0
    _res['d'] = {"pknum":_lessNum,"buyneed":_buyNeed,"buynum":_lessBuyNum}
    return _res

if __name__ == "__main__":
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[''])

