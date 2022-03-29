#!/usr/bin/python
#coding:utf-8
'''
公会 - 创建公会
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [{ghname: 公会名, 'flag': 公会旗帜, 'info':公告, 'auto':是否自动批准(0, 1)}]
    :return:
    ::

        {
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    #级别不足,无法创建公会
    if not g.chkOpenCond(uid,'gonghui'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    #级别不足,无法创建公会
    if gud.get('vip',0) < 2:
        _res['s'] = -10
        _res['errmsg'] = g.L('gonghuicreate_res_-10')
        return _res
    
    _gCon = g.m.gonghuifun.getCon()
    #公会名
    name = data[0]['ghname']
    #公会旗帜
    flag = str(data[0]['flag'])
    #公会公告
    notice = data[0]['info']
    # 是否自动批准
    _auto = data[0].get('auto', 1)
    # 加入等级
    _joinLv = int(data[0].get('joinlv', 1))

    if not g.m.gonghuifun.canJoin(uid):
        #距离上次退会不足12小时
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghui_apply_res_-5')
        return _res
   
    #名称参数有误
    if flag not in _gCon['flags'] or not 0 < _joinLv <= g.GC['userinfo']['maxlv']:
        _res["s"]=-1
        _res["errmsg"]=g.L('gonghuicreate_res_-1')
        return _res
    
    if g.checkWord(notice)!=True or len(notice)>60:
        #公告有非法字符或超出字数限制
        _res["s"]=-9
        _res["errmsg"] =g.L("gonghuicreate_res_-9")
        return _res

    #名称参数有误
    if not isinstance(name,basestring):
        _res["s"]=-10
        _res["errmsg"]=g.L('gonghuicreate_res_-1')
        return _res
    
    for ele in name:
        if not g.C.is_chinese(ele):
            _res['s'] = -3
            _res['errmsg'] = g.L("gonghuicreate_res_-7")
            return _res

    #不可超过6个汉字
    if len(name) > 6 or len(name) == 0:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghuicreate_res_-2')
        return _res

    #名称含有非法字符
    if g.checkWord(name)!=True:
        _res["s"]=-4
        _res["errmsg"] =g.L("gonghuicreate_res_-4")
        return _res
    
    # vip1才能创建公会
    '''if gud["vip"] < _gCon["viplv"]:
        _res["s"]=-8
        _res["errmsg"]=g.L('gonghuicreate_res_-8')
        return _res'''

    # 猫耳平台
    if g.chkOwnerIs('maoerbl'):
        isOk, rmsg = g.m.maoerfun.maoErPostSociaty(uid=uid, name=name)
        # 验证失败 不能发送
        if not isOk:
            _res["s"] = -20
            _res["errmsg"] = g.L('chat_maoer_api')
            return _res
        else:
            name = rmsg

    #公会已存在
    _ghInfo = g.mdb.find1('gonghui',{"name":name},fields=['_id','name'])
    if _ghInfo:
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghuicreate_res_-5')
        return _res



    #已加入公会,无法创建
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid})
    if _ghUserInfo:
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghuicreate_res_-6')
        return _res
    
    #公会花费需求
    _need = _gCon['createghneed']
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
    _sendData = g.delNeed(uid, _need, 0,logdata={'act': 'gonghui_create'})
    g.sendChangeInfo(conn, _sendData)
    
    #创建公会
    _ghid = g.m.gonghuifun.createGonghui(uid,name,flag,notice,lv=_joinLv,auto=_auto)
    #以会长身份加入公会
    _oid = g.m.gonghuifun.joinGonghui(uid,_ghid,power=0)
    #推送公会消息
    g.m.gonghuifun.gonghuiChangeSend(uid,conn)
    #增加公会日志--创建公会
    g.m.gonghuifun.addGHLog(_ghid,1,[gud['name']])
    # 神器任务
    g.event.emit('artifact', uid, 'gonghui',isinc=0)

    # 更新拉稀战场数据
    g.crossDB.update('gonghui_siege',{'uid':uid},{'ghid':_ghid})
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = {
        'ghname':'aaa',
        'flag':'1',
        'info':'aaa'
    }
    print doproc(g.debugConn,[_data])