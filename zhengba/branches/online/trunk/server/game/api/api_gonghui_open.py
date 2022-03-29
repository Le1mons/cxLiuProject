#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 公会主界面信息
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
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res
    
    _ghData = g.m.gonghuifun.getGongHuiByUid(uid)
    #捐献信息
    _jxData = g.m.gonghuifun.getJuanXianData(uid)
    # 检查公会是否再弹劾
    g.m.gonghuifun.chkImpeach(_ghid)
    _resData = {}
    _resData['ghdata'] = _ghData
    _resData['fbid'] = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    if _jxData:_resData['juanxian'] = _jxData
    _res['d'] = _resData
    return _res
        
    
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('lq02')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)