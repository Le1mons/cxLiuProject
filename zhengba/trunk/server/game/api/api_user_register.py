#!/usr/bin/python
# coding:utf-8
'''
玩家 - 注册
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [新名字:str]
    :return:
    ::

        {s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _newName = data[0]
    _binduid = g.mc.get(g.C.STR("{1}_binduid",conn.sessid))
    #binduid有错误
    if _binduid == None:
        _res['s']=-6
        _res['errmsg']=g.L('global_unlogin')
        return (_res)


    #名称参数有错误
    if not isinstance(_newName, basestring):
        _res["s"] = -1
        _res["errmsg"] = g.L('user_register_res_-1')
        return _res
    #判断名字是否为汉字
    for ele in _newName:
        if not g.C.is_chinese(ele):
            _res['s'] = -3
            _res['errmsg'] = g.L("user_register_res_-3")
            return _res

    #汉字不仅而已超过6个
    if len(_newName) > 6 or len(_newName) < 2:
        _res["s"] = -2
        _res["errmsg"] = g.L('user_register_res_-2')
        return _res

    #名字含有非法字符
    if g.checkWord(_newName) != True:
        _res["s"] = -4
        _res["errmsg"] = g.L("user_register_res_-4")
        return _res

    #判断名字是否存在
    _ghInfo = g.mdb.find1('userinfo', {"name": _newName}, fields=['_id', 'name'])
    if _ghInfo:
        _res["s"] = -5
        _res["errmsg"] = g.L('user_register_res_-5')
        return _res
    _optime = g.getOpenTime()
    _sess = g.m.sess.Session(str(uid))
    _lastSid = _sess.get("sid")
    if _lastSid != None:
        g.mc.delete(_lastSid)

    _sid = conn.sessid
    _nt = g.C.NOW()
    _sess.set("sid", str(_sid))
    _sess.set("uid", uid)
    #设置名字信息
    g.mdb.update('userinfo', {'uid': uid}, {'name': _newName})
    # 清除gud缓存
    g.m.gud.reGud(uid)
    gud = g.getGud(uid)
    gud["logintime"] = _nt
    g.m.gud.setGud(uid, gud)
    g.mc.set(_sid, uid)
    # 更新登陆时间
    _r = g.m.userfun.updateUserInfo(uid, {"logintime": _nt})
    # _res["d"] = {"gud": gud, "opentime": _optime}
    #将改名信息推送给客户端
    _sendData = {"attr":{"name":_newName}}
    g.sendChangeInfo(conn,_sendData)

    return _res




if __name__ == "__main__":
    uid = g.buid("haddugdu")
    heads = list(g.GC["pre_defshowhead"])

    g.debugConn.uid = uid

    print doproc(g.debugConn,[u"大哥你好吧"])

    # _rhead = g.C.getRandList(heads)
    # print(doproc(g.debugConn, [u"不是谁"]) )
    #
    # print "******************"
    # print type(heads),heads
    # print "*****************"
    # print _rhead[0]

    # g.debugConn.uid = uid

    # print doproc(g.debugConn,["大哥"])