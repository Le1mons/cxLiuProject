#!/usr/bin/python
#coding:utf-8
'''
公会 - 申请加入公会
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [工会的tid:str]
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
    _ghInfo = g.mdb.find1('gonghui',{"_id":g.mdb.toObjectId(_ghid)},fields=['_id','name','maxusernum','auto','usernum','joinlv'])
    if not _ghInfo:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res

    if g.getGud(uid)['lv'] < _ghInfo['joinlv']:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_limitlv')
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

    # 自动加入
    if _ghInfo.get('auto') and _ghInfo['usernum'] < _ghInfo['maxusernum']:
        # 已加入公会,无法申请
        _ghUserInfo = g.mdb.find1('gonghuiuser', {'uid': uid})
        if _ghUserInfo:
            # 该玩家已被其他公会接收
            _res["s"] = -3
            _res["errmsg"] = g.L('gonghui_join_res_-3')
            g.mdb.delete('gonghuiapply', {'uid': uid, 'ghid': _ghid})
            return _res

        # 以会长身份加入公会
        _oid = g.m.gonghuifun.joinGonghui(uid, _ghid, power=3)
        g.m.gud.reGud(uid)
        # 更新缓存ghid
        gud = g.getGud(uid)
        _attrMap = {}
        _attrMap.update({"ghid": _ghid, 'ghname': _ghInfo['name'], 'ghpower': 3})
        g.sendUidChangeInfo(uid, {"attr": _attrMap})
        # 增加公会日志--加入公会
        g.m.gonghuifun.addGHLog(_ghid, 2, [gud['name']])
        # 神器任务
        g.event.emit('artifact', uid, 'gonghui', isinc=0)
        # 更新拉稀战场数据
        g.crossDB.update('gonghui_siege', {'uid': uid}, {'ghid': _ghid})
    else:
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