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
    #被任命的玩家uid
    _touid = str(data[0])
    #任命官职
    _rmPower = int(data[1])
    _rmType = 'putong'
    if _rmPower == 0:
        _rmType = 'huizhang'
        # 只有对方满60级才能任命会长
        if not g.chkOpenCond(_touid, 'president'):
            _res['s'] = -10
            _res['errmsg'] = g.L('gonghui_renzhi_res_-10')
            return _res

    if  _rmPower not in (0,1,3):
        #参数有误
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res
    
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    name = gud['ghname']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res
    
    _toUserData = g.mdb.find1('gonghuiuser',{'uid':_touid,'ghid':_ghid})
    if _toUserData == None:
        #被任命人不在公会中
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghui_renzhi_res_-2')
        return _res

    if _rmPower == 1:
        #如果是任命官员,需要判断官员上限
        _gcon = g.m.gonghuifun.getCon()
        _maxGuanYuan = _gcon['maxpower1']
        _nowNum = g.mdb.count('gonghuiuser',{'ghid':_ghid,'power':1})
        if _nowNum >= _maxGuanYuan:
            #官员位置已满，无法升为官员
            _res['s'] = -3
            _res['errmsg'] = g.L('gonghui_renzhi_res_-3')
            return _res
    
    _userData = g.mdb.find1('gonghuiuser',{'uid':uid,'ghid':_ghid})
    _userPower = int(_userData['power'])
    _touserPower = int(_toUserData['power'])
    if _userPower >= _touserPower:
        #无权限任命同级或高级的会员
        _res['s'] = -4
        _res['errmsg'] = g.L('gonghui_renzhi_res_-4')
        return _res
    
    #如果是任命会长需要有特殊处理
    if _rmPower == 0:
        #自己变为会员
        g.mdb.update('gonghuiuser',{'uid':uid,'ghid':_ghid},{'power':3})
        g.m.gud.reGud(uid)
        gud = g.getGud(uid)
        _attrMap = {}
        _attrMap.update({"ghid":_ghid,'ghname':name,'ghpower':3})
        g.sendChangeInfo(conn,{"attr":_attrMap})
    
    g.mdb.update('gonghuiuser',{'uid':_touid,'ghid':_ghid},{'power':_rmPower})
    #更新缓存ghid
    g.m.gud.reGud(_touid)
    _toGud = g.getGud(_touid)
    _attrMap = {}
    _attrMap.update({"ghid":_ghid,'ghname':name,'ghpower':_rmPower})
    g.sendUidChangeInfo(_touid,{"attr":_attrMap})
    
    _ghData = g.m.gonghuifun.getGongHuiByUid(uid)
    _resData = {}
    _resData['ghdata'] = _ghData
    _res['d'] = _resData
    _powerKey = g.C.STR('gonghui_powername_{1}',_rmPower)
    _powerName = g.L(_powerKey)
    if _rmType == 'putong':
        #普通任命
        #增加公会日志--任命
        g.m.gonghuifun.addGHLog(_ghid,5,[_toGud['name'],gud['name'],_powerName])
    else:
        g.m.gonghuifun.addGHLog(_ghid,6,[gud['name'],_toGud['name']])
        
    return _res
        
    
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dfe','1']
    print doproc(g.debugConn,_data)