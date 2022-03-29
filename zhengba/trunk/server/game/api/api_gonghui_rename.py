#!/usr/bin/python
#coding:utf-8
'''
公会 - 修改公会名
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [公会名]
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
    _ghName = data[0]
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid})
    if not _ghUserInfo or int(_ghUserInfo['power']) not in [0]:
        #权限不足，无法操作
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghui_golbal_nopower')
        return _res
    
    #名称参数有误
    if not isinstance(_ghName,basestring):
        _res["s"]=-1
        _res["errmsg"]=g.L('gonghuicreate_res_-1')
        return _res
    
    for ele in _ghName:
        if not g.C.is_chinese(ele):
            _res['s'] = -3
            _res['errmsg'] = g.L("gonghuicreate_res_-7")
            return _res
        
    #不可超过6个汉字
    if len(_ghName) > 6 or len(_ghName) == 0:
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghuicreate_res_-2')
        return _res
    
    #名称含有非法字符
    if g.checkWord(_ghName)!=True:
        _res["s"]=-4
        _res["errmsg"] =g.L("gonghuirename_res_-4")
        return _res

    # 猫耳平台
    if g.chkOwnerIs('maoerbl'):
        isOk, rmsg = g.m.maoerfun.maoErPostSociaty(uid=uid, name=_ghName)
        # 验证失败 不能发送
        if not isOk:
            _res["s"] = -20
            _res["errmsg"] = g.L('chat_maoer_api')
            return _res
        else:
            _ghName = rmsg

    #公会已存在
    _ghInfo = g.mdb.find1('gonghui', {"name":_ghName}, fields=['_id', 'name'])
    if _ghInfo:
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghuicreate_res_-5')
        return _res
    
    _gcon = g.m.gonghuifun.getCon()
    #更名花费
    _need = _gcon['changenameneed']
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
    _sendData = g.delNeed(uid, _need, 0,logdata={'act': 'gonghui_rename'})
    g.sendChangeInfo(conn, _sendData)
    
    #设置信息
    g.mdb.update('gonghui',{'_id':g.mdb.toObjectId(_ghUserInfo['ghid'])},{'name':_ghName})
    #推送公会消息
    g.m.gonghuifun.gonghuiChangeSend(uid,conn)
    return _res
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq2')
    print g.debugConn.uid
    _data = '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
    print g.checkWord(_data)