#!/usr/bin/python
# coding:utf-8
import sys

sys.path.append('..')
import g

'''
邮件 - 发送个人邮件
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 邮件内容
    _content = data[0]
    # 邮件标题
    _title = data[1]
    #etype代表个人邮件
    etype = 3

    touid = str(data[3])
    gud = g.getGud(uid)
    toGud = g.getGud(touid)

    # 只允许100个字
    if len(_content) > 100 or len(_content) == 0 or len(_title) == 0:
        _res["s"] = -1
        _res["errmsg"] = g.L("emailsend_res_-1")
        return (_res)

    # 检查内容是否有脏话
    if (not g.checkWord(_content)) or (not g.checkWord(_title)):
        _res["s"] = -2
        _res["errmsg"] = g.L("emailsend_res_-6")
        return (_res)

    # 玩家不存在
    if toGud == None:
        _res["s"] = -2
        _res["errmsg"] = g.L("emailsend_res_-2")
        return (_res)

    # 玩家不能是自己
    if uid == touid:
        _res["s"] = -3
        _res["errmsg"] = g.L("emailsend_res_-3")
        return (_res)

    # 等级未达到15级 无法发送
    if int(gud['lv']) < 15:
        _res["s"] = -4
        _res["errmsg"] = g.L("emailsend_res_-4")
        return (_res)

    # 判断邮件次数是否达到上限
    if g.m.emailfun.getSendEmailNum(uid, etype) > 10:
        _res["s"] = -5
        _res["errmsg"] = g.L("emailsend_res_-5")
        return (_res)

    # 判断是否被屏蔽
    listShieldFriend = g.m.friendfun.getShieldList(touid)
    if uid in listShieldFriend:
        return _res

    if(len(g.chatBlackWordReg.findall(_content))>0 or len(g.chatBlackWordReg.findall(_title))>0):
        pass
    else:
        _r = g.m.emailfun.sendGerenEmail(uid, touid, _title , _content)
        g.m.emailfun.sendNewEmailMsg(touid, 3)
        
    return (_res)


if __name__ == "__main__":
    # for i in range(0,11):
    g.debugConn.uid = g.buid('jingqi_1810161000122676')
    print doproc(g.debugConn, ["ddddddddddddddd","1",1,"0_5bc01c47c0911a2c50550e5d"])
