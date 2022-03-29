#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 踢出公会
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    #踢出公会的玩家uid
    _kickUid = str(data[0])
    if uid == _kickUid:
        #玩家不能踢自己
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_kick_res_-2')
        return _res
    
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        #玩家无公会信息
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _toUserData = g.mdb.find1('gonghuiuser',{'uid':_kickUid,'ghid':_ghid})
    if _toUserData == None:
        #玩家无公会信息
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _ghPower = int(gud['ghpower'])
    if _ghPower not in (0,1):
        #权限不足，无法操作
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_golbal_nopower')
        return _res
    
    _kickPower = int(_toUserData['power'])
    if _ghPower >= _kickPower or _kickPower == 0:
        #无法提出职位高于或同级职位的玩家
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghui_kick_res_-5')
        return _res

    # 清除团队任务的排行数据
    g.m.teamtaskfun.unsetUserDps(_kickUid)

    g.m.gonghuifun.exitGonghui(_kickUid,_ghid,1)
    g.m.gud.reGud(_kickUid)
    #更新缓存ghid
    _kickGud = g.getGud(_kickUid)
    _attrMap = {}
    _attrMap.update({"ghid":_kickGud['ghid'],'ghname':_kickGud['ghname'],'ghpower':_kickGud['ghpower']})
    g.sendUidChangeInfo(_kickUid,{"attr":_attrMap})
    #增加公会日志--请出公会
    g.m.gonghuifun.addGHLog(_ghid,4,[_kickGud['name'],gud['name']])

    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dff']
    print doproc(g.debugConn,_data)