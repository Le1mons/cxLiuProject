#!/usr/bin/python
# coding:utf-8
'''
聊天 - 发送聊天消息
'''

if __name__ == '__main__':
    import sys

    sys.path.append('..')
    sys.path.append('game')

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [聊天内容:str]
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
    # 发送内容
    content = data[0]
    # 聊天信息
    mtype = 2
    _fdata = {"uid": 'SYSTEM',
              "name": u'GM指导员',
              "lv": 999,
              "vip": 0,
              "ctime": g.C.NOW(),
              "head": '25076',
              "sendType":0,
              # "sid": gud["sid"],
              # 'svrname':g.m.crosscomfun.getSNameBySid(gud["sid"])
              }
    # 综合聊天
    # 1为发送招募信息 2综合、3公会聊天，4 跨服聊天
    # 发送世界信息
    g.m.chatfun.sendMsg(content, mtype, data=_fdata)


    # 记录发送时间
    #conn.sess.set(g.C.STR("msgtime_{1}", mtype), g.C.NOW())
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn,["第三个第四个"])
    # print ifCrossOwner()
    # _fdata = {"uid": '46464646',
    #           "name": '刘思秋沙雕',
    #           "lv": 54,
    #           "vip": 1,
    #           "ctime": 0,
    #           "head":'12035',
    #           "sendType":0,
    #           "sid": '1',
    #           'svrname':'沙雕1服'
    #           }
    # g.m.crosschatfun.chatRoom.addCrossChat({'msg': '刘思秋是个沙雕', 'mtype': 4, 'fdata': _fdata, 'extarg': {}})
