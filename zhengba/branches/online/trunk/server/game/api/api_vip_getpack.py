#!/usr/bin/python
#coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
vip功能 - 领取vip礼包
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    #领取的vip礼包等级
    viplv = int(data[0])
    gud = g.getGud(uid)
    _con = g.m.vipfun.getVipCon()
    
    #vip级别未到无法领取
    if gud["vip"] < viplv or str(viplv) not in _con:
        _res["s"]=-1
        _res["errmsg"] = g.L("vip_getpack_res_-1")
        return _res

    #已领取列表
    _alreadyGetPack = g.m.vipfun.getAlreadyGetPack(uid)
    #已领取过无法再领取
    if viplv in _alreadyGetPack:
        _res["s"]=-2
        _res["errmsg"] = g.L("vip_getpack_res_-2")
        return _res

    #获取消耗
    _needMap = {'rmbmoney': -_con[str(viplv)]['nowpay']}
    _altNum = g.m.userfun.altNum(uid,_needMap)
    if _altNum[0]!=True:
        _res['s'] = -100
        _res['attr'] = _altNum[1]
        return _res

    g.m.userfun.updateUserInfo(uid,_needMap, {'act':'vip_getpack'})
    _r = g.m.vipfun.addGetVipPack(uid,viplv)
    #获取奖励
    _prize = list(_con[str(viplv)]["tqprize"])
    _changeInfo = g.getPrizeRes(uid,_prize,{"act":"VIPPACK","viplv":viplv})
    if 'attr' not in _changeInfo:
        _changeInfo['attr'] = {}

    _changeInfo['attr'].update(_needMap)

    _r = g.sendChangeInfo(conn,_changeInfo)

    #发送系统
    #_mCon = g.m.chatfun.getCon()
    #_msg = g.C.STR(_mCon['viplibao'],gud['name'],viplv,_con[str(viplv)]['t'])
    #g.m.chatfun.sendMsg(_msg,1,ifcheck=0)
    _res['gezinum'] = g.m.userfun.getGeziNum(uid)
    return _res

if __name__ == '__main__':
    uid = g.buid("tk1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["2"])
    '0_5aea81d0625aee4a04a0146d'