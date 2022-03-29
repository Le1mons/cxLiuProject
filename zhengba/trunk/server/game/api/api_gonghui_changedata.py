#!/usr/bin/python
#coding:utf-8
'''
公会 - 修改公会信息
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [{修改类型(joinlv加入等级, flag旗帜, notice公告, auto:自动批准): 修改后得值}]
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
    #需要修改的值
    _setVal = data[0]
    if type(_setVal) != type({}) or len(_setVal) == 0:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_argserr')
        return _res
    
    _ghUserInfo = g.mdb.find1('gonghuiuser',{'uid':uid})
    if not _ghUserInfo or int(_ghUserInfo['power']) not in [0]:
        #权限不足，无法操作
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghui_golbal_nopower')
        return _res

    _guildInfo = g.m.gonghuifun.getGongHuiInfo(_ghUserInfo['ghid'])

    _chkKey = ['joinlv','notice','flag','auto']
    _setData = {}
    for k,v in _setVal.items():
        if k not in _chkKey:
            _res["s"]=-1
            _res["errmsg"]=g.L('global_argserr')
            return _res
        
        if k == 'joinlv':
            #加入等级只能在1到999之前
            _joinlv = int(v)
            _setData[k] = _joinlv
            if _joinlv < 1 or _joinlv > 999:
                #加入公会等级只能在1到999之间
                _res["s"]=-2
                _res["errmsg"]=g.L('gonghui_changedata_res_-2')
                return _res

        elif k == 'flag' and v != _guildInfo['flag']:
            _gCon = g.m.gonghuifun.getCon()
            flag = str(v)
            _setData[k] = flag
            if flag not in _gCon['flags']:
                #旗帜选择信息有误
                _res["s"]=-3
                _res["errmsg"]=g.L('gonghuicreate_res_-3')
                return _res
        elif k == 'notice' and v != _guildInfo['notice']:
            # 创建7天后才能修改公告
            if g.C.NOW() < g.C.ZERO(_guildInfo['ctime']) + 7 * 24 * 3600:
                _res["s"] = -7
                _res["errmsg"] = g.L('gonghui_changedata_res_-7')
                return _res

            notice = str(v)
            _setData[k] = notice
            if g.checkWord(notice)!=True or len(notice)>60:
                #公告有非法字符或超出字数限制
                _res["s"]=-4
                _res["errmsg"]=g.L('gonghuicreate_res_-4')
                return _res

            # 猫耳平台
            if g.chkOwnerIs('maoerbl'):
                isOk, rmsg = g.m.maoerfun.maoErPostSociaty(uid=uid, notice=notice)
                # 验证失败 不能发送
                if not isOk:
                    _res["s"] = -20
                    _res["errmsg"] = g.L('chat_maoer_api')
                    return _res
                else:
                    _setData[k] = rmsg

        elif k == 'auto':
            _setData[k] = v
    
    #设置信息
    g.mdb.update('gonghui',{'_id':g.mdb.toObjectId(_ghUserInfo['ghid'])},_setData)
    #推送公会消息
    g.m.gonghuifun.gonghuiChangeSend(uid,conn)
    return _res
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    _data = {
        'joinlv':85,
        'flag':'1',
        'notice':'aaa'
    }
    print doproc(g.debugConn,[_data])