#!/usr/bin/python
#coding:utf-8
'''
人物 - 领取兑换码
'''
if __name__=='__main__':
    import sys
    sys.path.append('..')

import g



def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid

    cdata = str(data[0])
    hdid = int(data[1])
    
    #获取已开启的活动列表
    _hdList = g.m.huodongfun.getOpenList(uid,1)
    #活动未开放无法获取列表
    if hdid not in _hdList:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_nohuodong')
        return (_res)
    
    hdData = g.m.huodongfun.getHuodongData(uid,hdid)
    if hdData['myinfo']['val'] == 1:
        _res["s"]=-1
        _res["errmsg"]=g.L('usergetcard_res_-1')
        return (_res)

    _strLen = len(cdata)
    #领取信息格式有误
    if _strLen < 3:
        _res["s"]=-2
        _res["errmsg"]=g.L("usergetcard_res_-2")
        return _res
    
    _doNum = int(_strLen*0.5)
    _doStr = cdata[0:_doNum]
    _args = g.m.kbase64.KBase64().decodeSting(_doStr[::-1]+cdata[_doNum:])
    #领取信息格式有误
    if _args[1] == False:
        _res["s"]=-3
        _res["errmsg"]=g.L("usergetcard_res_-2")
        return _res
    
    _args = g.m.myjson.read(_args[0])

    binduid = str(_args[0])
    nt = str(_args[1])
    md5Key = str(_args[2])
    prize = str(_args[3])

    _chkMD5Key = g.C.md5(binduid + nt + prize + 'DwjNnP6k')
    #领取信息格式有误
    if md5Key!=_chkMD5Key:
        _res["s"]=-4
        _res["errmsg"]=g.L("usergetcard_res_-2")
        return _res
    
    gud = g.getGud(uid)
    #领取信息格式有误
    if gud['binduid'] != binduid:
        _res["s"]=-5
        _res["errmsg"]=g.L("usergetcard_res_-2")
        return _res        
    
    _prize = g.m.myjson.read(prize)

    g.m.huodongfun.setMyHuodongData(uid, hdid, {"val":1,"gotarr":_prize})
    #兑换成功
    _prizeMap = g.getPrizeRes(uid,_prize,"fengcefanli")
    _r = g.sendChangeInfo(conn,_prizeMap)
    _nPrize = g.mergePrize(_prize,uid=uid)
    _res["d"] = _nPrize
    return _res

if __name__ == "__main__":
    g.debugConn.uid = "60_5a9375efe13823142b28806c"
    proc(g.debugConn,['0kDZxUmYjNTZ1UWM3AjN1ITNhNzYhRzM1gjNlljN0MmIsUTO5YDNzMjM1EDLig2YnJyWIiwiW3tcImFcIjpcImF0dHJcIixcInRcIjpcInJtYm1vbmV5XCIsXCJuXCI6M31dIl0=',1523280338])
