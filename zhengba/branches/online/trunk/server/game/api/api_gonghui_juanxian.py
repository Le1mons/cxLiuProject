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
    _jxtype = str(data[0])
    _gcon = g.m.gonghuifun.getCon()
    if _jxtype not in _gcon['juanxian']:
        #捐献类型有误
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_juanxian_res_-4')
        return _res
    
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _jxData = g.m.gonghuifun.getJuanXianData(uid)
    if _jxData:
        #今日已捐献
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_juanxian_res_-3')
        return _res
    
    _jxcon = _gcon['juanxian'][_jxtype]
    _need = _jxcon['need']
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
    
    
    #扣除消耗
    _sendData = g.delNeed(uid, _need, 0,logdata={'act': 'gonghui_juanxian','jxtype':_jxtype})
    g.sendChangeInfo(conn, _sendData)
    #设置捐献
    g.m.gonghuifun.setJuanXianData(uid,_jxtype)
    #添加公会经验
    _addExp = _jxcon['exp']
    g.m.gonghuifun.setGongHuiExp(_ghid,_addExp)
    
    _prize =  _jxcon['prize']
    _prizeRes = g.getPrizeRes(uid,_prize, {'act': 'gonghui_juanxian','jxtype':_jxtype})
    g.sendChangeInfo(conn,_prizeRes)
    _ghData = g.m.gonghuifun.getGongHuiInfo(_ghid)
    _resData = {'prize':_prize,'exp':_ghData['exp']}
    _res['d'] = _resData
    #检测公会是否升级
    g.event.emit('gonghui_expchange',_ghid)
    #增加经验日志
    g.m.gonghuifun.addExpLog(uid,_ghid,_addExp)
    # 日常任务监听
    g.event.emit('dailytask', uid, 12)
    # 团队任务 3级捐献
    if _jxtype == '2':
        g.m.teamtaskfun.setTeamTaskVal(uid, '1')
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['0','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)