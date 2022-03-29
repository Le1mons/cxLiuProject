#!/usr/bin/python
# coding:utf-8
import sys

sys.path.append('..')
import g

'''
邮件 - 领取邮件奖励
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    eid = str(data[0])

    _emailInfo = g.m.emailfun.getEmailInfo(eid, "_id,uid,prize,getprize,plist,title")

    if _emailInfo == None:
        _res["s"] = -1
        _res["errmsg"] = g.L("EMAIL_NOEXISTS")
        return (_res)

    # 无权限领取该邮件或已经领过该邮件或邮件无奖励
    if "prize" not in _emailInfo or _emailInfo["uid"] not in (uid, "SYSTEM") or _emailInfo["getprize"] == 1:
        _res["s"] = -2
        _res["errmsg"] = g.L("EMAIL_NOGETPRIZE")
        return (_res)

    # 如果是全服奖励邮件判断是否已经领过
    if "plist" in _emailInfo and uid in _emailInfo["plist"]:
        _res["s"] = -3
        _res["errmsg"] = g.L("EMAIL_NOGETPRIZEBYsys")
        return (_res)

        # 全服邮件记录已领取
    if _emailInfo["uid"] == "SYSTEM":
        _r = g.m.emailfun.setEmailInfo(eid, {"$push": {"plist": uid, "rlist": uid}})
    else:
        # 个人记录已领取
        _r = g.m.emailfun.setEmailInfo(eid, {"getprize": 1, "isread": 1})

    # 获得奖励
    if _r['n']==1:
        _prize = g.getPrizeRes(uid, _emailInfo["prize"], {'act':"EMAIL",'tid':eid,'title':_emailInfo['title']})
        _r = g.sendChangeInfo(conn, _prize)
    return (_res)


if __name__ == "__main__":
    g.debugConn.uid = g.buid('lsq13')
    print doproc(g.debugConn, ['5b8e82f4c0911a29f4a04f78'])