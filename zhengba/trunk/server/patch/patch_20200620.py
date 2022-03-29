#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('./game')
import g
'''
刷新玩家的图鉴激活状态
'''
print 'start reset run'
_title = '07.27 外域争霸补偿'
if not g.mdb.find1('email', {'title': _title}):
    g.mdb.insert('email', {
        "rlist" : [],
        "from" : "GM",
        "ctime" : g.C.NOW(),
        "ttltime" : g.C.TTL(),
        "title" : _title,
        "dlist" : [],
        "getprize" : 0,
        # "content" : '尊敬的勇士，\n    由于周五夜间网络波动，造成部分服务器外域争霸决赛晋级异常，由于各赛区分组已完成且已开赛，给部分没能参赛的玩家造成不好的体验，对此我们深表歉意。我们将按照决赛冠军的奖励，向各位受影响的勇士发放补偿。\n    感谢您对我们的理解与支持，祝您游戏愉快！',
        "content" : '尊敬的勇士，<br>   由于周五夜间网络波动，造成部分服务器外域争霸决赛晋级异常，由于各赛区分组已完成且已开赛，给部分没能参赛的玩家造成不好的体验，对此我们深表歉意。我们将按照决赛冠军的奖励，向各位受影响的勇士发放补偿。<br>    感谢您对我们的理解与支持，祝您游戏愉快！',
        "etype" : 1,
        "showall" : 0,
        "needlv" : 0,
        "passtime" : 1596038400,
        "needvip" : 0,
        "uid" : "SYSTEM",
        "plist" : [],
        "prize" : [
            {
                "a" : "item",
                "t" : "2019",
                "n" : 14000
            },
            {
                "a": "item",
                "t": "3004",
                "n": 50
            },
            {
                "a": "item",
                "t": "2018",
                "n": 1000
            }
        ]
    })


print 'SUCCESS..............'
