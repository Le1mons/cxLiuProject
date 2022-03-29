#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 离开公会
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

    _ghPower = gud['ghpower']
    if _ghPower == 0:
        #如果是会长，不能退出公会
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_exit_res_-3')
        return _res

    # 清除团队任务的排行数据
    g.m.teamtaskfun.unsetUserDps(uid)

    g.m.gonghuifun.exitGonghui(uid,_ghid,0)
    g.m.gud.reGud(uid)
    #更新缓存ghid
    gud = g.getGud(uid)
    _attrMap = {}
    _attrMap.update({"ghid":gud['ghid'],'ghname':gud['ghname'],'ghpower':gud['ghpower']})
    _r = g.sendChangeInfo(conn,{"attr":_attrMap})
    #增加公会日志--离开公会
    g.m.gonghuifun.addGHLog(_ghid,3,[gud['name']])
    # 删除弹劾信息
    _impeach = g.m.gonghuifun.getImpeachInfo(_ghid)
    if _impeach:
        for idx,i in enumerate(_impeach['v']):
            if i['uid'] == uid:
                _impeach['v'].pop(idx)
                break
        _impeach = g.m.gonghuifun.setImpeachInfo(_ghid, _impeach['v'])

    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)