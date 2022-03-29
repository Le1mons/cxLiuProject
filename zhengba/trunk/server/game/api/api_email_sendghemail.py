# !/usr/bin/python
# coding:utf-8
'''
邮件 - 发送公会邮件
'''
import sys

sys.path.append('..')
import g



def proc(conn, data):
    """

    :param conn:
    :param data: [邮件内容, 邮件标题]
    :return:
    ::

        {'s': 1}

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
    etype = 2

    # 只允许60个字
    if len(_content) > 60 or len(_content) == 0 or len(_title) == 0:
        _res["s"] = -1
        _res["errmsg"] = g.L("emailsend_res_-1")
        return (_res)

    # 检查内容是否有脏话
    if (not g.checkWord(_content)) or (not g.checkWord(_title)):
        _res["s"] = -9
        _res["errmsg"] = g.L("email_sendghemail_-2")
        return (_res)

        # 对工会邮件的判断
    gud = g.getGud(uid)

    # 检查是否为工会会长
    if gud['ghpower'] != 0:
        _res["s"] = -3
        _res["errmsg"] = g.L("email_sendghemail_-3")
        return _res

    _ghid = gud['ghid']
    _ghMemberId = g.mdb.find("gonghuiuser", {"ghid": _ghid}, fields=['_id', 'uid'])  # 返回一个包括自己的uid列表

    # 判断工会里面的成员是否为空或者只有自己
    if _ghMemberId != [] and len(_ghMemberId) > 0:
        useridList = [i['uid'] for i in _ghMemberId if i['uid'] != uid]
        if useridList == []:
            _res["s"] = -6
            _res["errmsg"] = g.L("email_sendghemail_-6")
            return _res
    else:
        _res["s"] = -7
        _res["errmsg"] = g.L("email_sendghemail_-6")
        return _res

    # 判断发送邮件的次数
    if g.m.emailfun.getSendEmailNum(uid, etype) > 3:
        _res["s"] = -5
        _res["errmsg"] = g.L("email_sendghemail_-5")
        return (_res)


    # 猫耳平台
    if g.chkOwnerIs('maoerbl'):
        isOk, rtitle, rcontent = g.m.maoerfun.maoErPostMail(uid=uid, title=_title, content=_content)
        # 验证失败 不能发送
        if not isOk:
            _res["s"] = -20
            _res["errmsg"] = g.L('chat_maoer_api')
            return _res
        else:
            _title = rtitle
            _content = rcontent

    _r = g.m.emailfun.sendEmails(useridList, etype, _title, _content)
    if _r is not None:
        g.m.emailfun.setSendEmailNum(uid, etype, num=1)
    g.m.emailfun.sendNewEmailMsg(useridList, 2)


    return (_res)


if __name__ == "__main__":
    # for i in range(0,11):
    g.debugConn.uid = g.buid('lsq13')
    print doproc(g.debugConn, ["ffffff","公会通知",2,None])
    pass
