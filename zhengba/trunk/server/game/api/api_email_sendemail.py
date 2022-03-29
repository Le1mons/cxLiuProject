#!/usr/bin/python
# coding:utf-8
'''
邮件 - 发送个人邮件
'''
import sys

sys.path.append('..')
import g

def isBlack(uid):
    """
    检查是否被屏蔽了 不论什么频道 只要在列表里面就封掉

    :param uid:
    :return: bool
    """
    nt = g.C.NOW()
    # 真禁言
    blList = g.m.dball.getBlackList(uid, where={'ctype': 2, 'etime': {'$gt': nt}}, keys="_id,uid,etime,ctype")
    if blList:
        return True
    return False

def proc(conn, data):
    """

    :param conn:
    :param data: [邮件内容, 邮件标题, 玩家uid]
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
    # 邮件内容
    _content = data[0]
    # 邮件标题
    _title = data[1]
    #etype代表个人邮件
    etype = 3

    touid = str(data[3])
    gud = g.getGud(uid)
    toGud = g.getGud(touid)

    # 一分钟一次
    if g.C.NOW() <= gud.get('lastSendEmailTime', 0) + 60:
        _res["s"] = -10
        _res["errmsg"] = g.L("chat_send_-10")
        return _res

    gud['lastSendEmailTime'] = g.C.NOW()
    g.m.gud.setGud(uid, gud)

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

    if g.m.crosscomfun.chkIsThisService(touid):
        # 玩家不存在
        if toGud == None:
            _res["s"] = -2
            _res["errmsg"] = g.L("emailsend_res_-2")
            return (_res)
        # 判断是否被屏蔽
        listShieldFriend = g.m.friendfun.getShieldList(touid)
        if uid in listShieldFriend:
            return _res


    if(len(g.chatBlackWordReg.findall(_content))>0 or len(g.chatBlackWordReg.findall(_title))>0):
        pass
    else:
        if isBlack(uid):
            _res["s"] = -6
            _res["errmsg"] = g.L("email_sendghemail_-2")
            return (_res)

        # 猫耳平台
        if g.chkOwnerIs('maoerbl'):
            isOk, rtitle, rcontent = g.m.maoerfun.maoErPostMail(uid=uid, touid=touid, title=_title,
                                                                  content=_content)
            # 验证失败 不能发送
            if not isOk:
                _res["s"] = -20
                _res["errmsg"] = g.L('chat_maoer_api')
                return _res
            else:
                _title = rtitle
                _content = rcontent

        if g.m.crosscomfun.chkIsThisService(touid):
            _r = g.m.emailfun.sendGerenEmail(uid, touid, _title, _content)
            g.m.emailfun.sendNewEmailMsg([touid], 3)
        else:
            _emailData = {
                'title': _title,
                'uid': touid,
                'content': _content,
                'sid': touid.split('_')[0],
                'ifpull': 0,
                'etype':3,
                "name": gud['name'],
                'senduid':uid
            }
            g.crossDB.insert('crossemail', g.m.emailfun.fmtEmail(**_emailData))

        # 0 私聊
        g.m.chatlogfun.saveLog(gud, '【私聊】'+_content, 0, touid=touid)
        
    return (_res)


if __name__ == "__main__":
    # for i in range(0,11):
    g.debugConn.uid = g.buid('jingqi_1810161000122676')
    print doproc(g.debugConn, ["ddddddddddddddd","1",1,"0_5bc01c47c0911a2c50550e5d"])
