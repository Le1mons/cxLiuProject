#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 申请加入公会
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _gCon = g.m.gonghuifun.getCon()
    #公会id
    _ghid = str(data[0])
    #级别不足,无法申请进入公会
    if not g.chkOpenCond(uid,'gonghui'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res
    
    # vip1才能创建公会
    '''if gud["vip"] < _gCon["viplv"]:
        _res["s"]=-8
        _res["errmsg"]=g.L('gonghuicreate_res_-8')
        return _res'''
    
    if not g.m.gonghuifun.canJoin(uid):
        #距离上次退会不足12小时
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghui_apply_res_-5')
        return _res

    #公会不存在
    _ghInfo = g.mdb.find1('gonghui',{"_id":g.mdb.toObjectId(_ghid)},fields=['_id','name'])
    if not _ghInfo:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    #已加入公会,无法申请
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid})
    if _ghUserInfo:
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_apply_res_-3')
        return _res
    
    _apply = g.mdb.find1('gonghuiapply',{'uid':uid,'ghid':_ghid})
    if _apply:
        #已经申请公会
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_apply_res_-4')
        return _res
    
    gud = g.getGud(uid)
    #添加申请
    _addData = {
        'uid':uid,
        'ghid':_ghid,
        "name":gud['name'],
        "lv":gud['lv'],
        'ctime':g.C.NOW(),
        'ttltime':g.C.UTCNOW()
    }
    g.mdb.insert('gonghuiapply',_addData)
    # 监听  红点通知会长和官员
    g.event.emit('guild_apply',_ghid)
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('ys1')
    print g.debugConn.uid
    _data = ['5b94cb79c0911a319c42d910']
    print doproc(g.debugConn,_data)