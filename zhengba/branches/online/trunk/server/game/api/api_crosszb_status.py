#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")


import g

'''
显示跨服争霸积分赛和争霸赛的状态
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    uid = conn.uid
    if not g.m.crosszbfun.ifOpen(uid):
        return {"s":-1,"errmsg": g.L("unopencrosszb") }

    _res = {"s":1,"d":{}}
    _resData = {}
    _resData['jifen'] = g.m.crosszbfun.getJFStatus()
    if _resData['jifen'] == 1:
        _jfArea = g.m.crosszbfun.getJiFenArea()
        _resData['jifencd'] = _jfArea[1]
        
    _resData['zhengba'] = g.m.crosszbfun.getZBStatus()
    if _resData['zhengba'] == 1:
        #战斗中
        _zbArea = g.m.crosszbfun.getZhengBaArea()
        _resData['zhengbacd'] = _zbArea[1]
    elif _resData['zhengba'] == 3:
        #筹备中
        _zbArea = g.m.crosszbfun.getZhengbaCBArea()
        _resData['zhengbacd'] = _zbArea[1]

    # 更新跨服的headdata
    _data = g.getAttrByDate(uid,{'ctype':"headdata_update"})
    if not _data:
        _head = g.m.userfun.getShowHead(uid)
        g.crossDB.update('crosszb_jifen',{'uid':uid},{'headdata':_head})
        g.crossDB.update('jjcdefhero',{'uid':uid},{'headdata':_head})
        g.setAttr(uid, {'ctype': "headdata_update"},{'v':1})

    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    #测试vip等级上升后，viplvchange事件是否正确
    #uid = g.buid("666")
    #g.debugConn.uid = uid
    #print doproc(g.debugConn, [1])
    print g.m.crosszbfun.checkIfOpenByOpenTime()