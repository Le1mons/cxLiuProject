#!/usr/bin/python
#coding:utf-8
'''
公会 - 同意加入公会
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [申请加入公会的玩家uid]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _gCon = g.m.gonghuifun.getCon()
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
    
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid})
    if not _ghUserInfo or int(_ghUserInfo['power']) not in (0,1):
        #权限不足，无法操作
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghui_golbal_nopower')
        return _res

    #公会不存在
    _ghInfo = g.mdb.find1('gonghui',{"_id":g.mdb.toObjectId(_ghid)},fields=['_id','name','maxusernum'])
    if not _ghInfo:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _userNum = g.mdb.count('gonghuiuser',{'ghid':_ghid})
    if _userNum >= _ghInfo['maxusernum']:
        #会员人数已达上限
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghui_join_res_-5')
        return _res
    
    name = _ghInfo['name']
    _apply = g.mdb.find1('gonghuiapply',{'uid':_touid,'ghid':_ghid})
    if not  _apply:
        #未发起过申请
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_join_res_-4')
        return _res
    
    #已加入公会,无法申请
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':_touid})
    if _ghUserInfo:
        #该玩家已被其他公会接收
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_join_res_-3')
        g.mdb.delete('gonghuiapply',{'uid':_touid,'ghid':_ghid})
        return _res

    #删除该玩家其他工会的申请
    # g.mdb.delete('gonghuiapply',{'uid':_touid,'ghid':_ghid})
    g.mdb.delete('gonghuiapply',{'uid':_touid})
    #以会长身份加入公会
    _oid = g.m.gonghuifun.joinGonghui(_touid,_ghid,power=3)
    g.m.gud.reGud(_touid)
    #更新缓存ghid
    gud = g.getGud(_touid)
    _attrMap = {}
    _attrMap.update({"ghid":_ghid,'ghname':name,'ghpower':3})
    g.sendUidChangeInfo(_touid,{"attr":_attrMap})
    #增加公会日志--加入公会
    g.m.gonghuifun.addGHLog(_ghid,2,[gud['name']])
    # 神器任务
    g.event.emit('artifact', _touid, 'gonghui',isinc=0)

    # 更新拉稀战场数据
    g.crossDB.update('gonghui_siege',{'uid':_touid},{'ghid':_ghid})
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)