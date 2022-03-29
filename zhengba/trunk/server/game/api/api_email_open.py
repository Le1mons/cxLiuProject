#!/usr/bin/python
# coding:utf-8
'''
邮件 - 打开邮件列表
'''
import sys

sys.path.append('..')

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"1 系统邮件": [], "2 公会邮件":[], "3 个人邮件": []
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 1系统邮件 2工会邮件 3个人邮件
    gud = g.getGud(uid)
    _rData = {"1": [], "2": [], "3": []}
    _nt = g.C.NOW()
    # _myShiliInfo = g.m.shilifun.getMyShiliInfo(uid,"ctime")
    need_keys = "senduid,getprize,content,title,ctime,passtime,prize,etype,isread,plist,dlist,uid,needlv,name,sid,vipzs"
    _emailList = g.m.emailfun.getEmailList(uid, need_keys, sort=[["ctime", -1]], limit=50)
    for ele in _emailList:
        etype = str(int(ele["etype"]))
        _ndata = {}
        _ndata.update(ele)
        _ndata["eid"] = str(_ndata["_id"])
        del _ndata["etype"]
        if etype == "3":
            if 'name' in ele:
                _ndata["binduid"] = ele["name"]
            else:
                _sendgud = g.getGud(_ndata["senduid"])
                _ndata["binduid"] = _sendgud["name"]
        if "prize" in _ndata:
            _ndata["prize"] = ele["prize"]

        # 已删除的系统邮件
        if "dlist" in _ndata:
            if uid in _ndata['dlist']:
                continue

            del _ndata['dlist']

        if "plist" in _ndata:
            _ndata['getprize'] = 0
            if uid in _ndata['plist']: _ndata['getprize'] = 1
            del _ndata['plist']

        # 判断是否过期
        if "passtime" in _ndata and _nt > _ndata['passtime']:
            continue

        # 根据等级显示
        if 'needlv' in ele and ele['needlv'] > gud['lv']:
            continue

        del _ndata['_id']

        if "isread" in _ndata:
            _ndata["isread"] = 1
            g.m.emailfun.setEmailInfo(str(ele["_id"]),data={"isread":1})
        _rData[etype].append(_ndata)

    # 如果是红点获取邮件列表会有额外参数，不设置检测时间
    if data and data[0] == None:
        g.m.emailfun.setLastChkTime(uid)

    _res["d"] = _rData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('pjy1')
    print doproc(g.debugConn, [{}])