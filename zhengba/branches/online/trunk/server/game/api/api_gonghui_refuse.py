#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 拒绝加入公会申请
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
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res

    #申请加入公会的玩家
    _touid = str(data[0])
    #公会未开放
    if not g.chkOpenCond(uid,'gonghui'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res
    
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid,'ghid':_ghid})
    if not _ghUserInfo or int(_ghUserInfo['power']) not in (0,1):
        #权限不足，无法操作
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nopower')
        return _res

    #删除申请
    g.mdb.delete('gonghuiapply',{'uid':_touid,'ghid':_ghid})
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)