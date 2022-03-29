#!/usr/bin/python
# coding:utf-8
'''
邮件 - 一键领取奖励
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

        {"prize": []
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _wheres = {"getprize": 0, "plist": {"$nin": [uid]}, "prize": {"$exists": 1}}
    need_keys = ""
    _emailList = g.m.emailfun.getEmailList(uid, need_keys, _wheres, gm=False)
    # 没有可领取的奖励

    if len(_emailList) == 0:
        _res["s"] = -1
        _res["errmsg"] = g.L("emailprize_res_-1")
        return (_res)

    _prizeArr = []
    _idList, typeList = [], []
    for ele in _emailList:
        eid = str(ele["_id"])
        _idList.append(eid)
        typeList.append(ele['title'])
        if ele["uid"] == "SYSTEM":
            _r = g.m.emailfun.setEmailInfo(eid, {"$push": {"plist": uid, "rlist": uid}})
        else:
            _r = g.m.emailfun.setEmailInfo(eid, {"getprize": 1,"isread":1})
            
        if _r['n']==1 and ele["getprize"] == 0:
            _prizeArr += ele["prize"]
    
    if len(_prizeArr)>0:
        _prize = g.getPrizeRes(uid, g.fmtPrizeList(_prizeArr), {'act':"EMAIL",'tid':_idList,'type':typeList})
        _r = g.sendChangeInfo(conn, _prize)

    _res["d"] = _prizeArr
    return _res


if __name__ == '__main__':
    uid = g.buid('lsq444')
    g.debugConn.uid = uid
    _r = doproc(g.debugConn, [])
    print _r