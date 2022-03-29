#!/usr/bin/python
#coding:utf-8

#跨服争霸赛争霸消息推送

import g


def proc(arg,karg):
    print 'crosszb_zbendshow start ...'
    if not g.m.crosszbfun.checkIfOpenByOpenTime():
        return
    
    if g.C.getWeek()  != 0:
        return

    #争霸赛结算提醒邮件
    _nt = g.C.NOW()
    _passtime = _nt + 3600*26 #过期时间到星期二 0:00 过期
    _email = {
        "uid":"SYSTEM",
        "title":"争霸赛结算啦！",
        "content":"本届跨服争霸赛结算啦，快去争霸赛查看排名领取奖励吧！",
        "etype":'1'
    }
    g.m.emailfun.sendEmail(**_email)
    print 'crosszb_zbendshow end ...'