#!/usr/bin/python
#coding:utf-8

'''
聊天 - 获取缓存聊天列表
'''

if __name__ == '__main__':
    import sys

    sys.path.append('..')
import g

def proc(conn,data):
    """

    :param conn:
    :param data: []
    :param key:
    :return:
    ::

        {'d'消息列表: [], 's': 1}
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    
    _chatQueue = g.m.chatfun.getChatList(uid)
    _res["d"] = _chatQueue
    return (_res)


if __name__ == "__main__":
    g.debugConn.uid = "0_5b4b139ff3a6a0390ca490e8"
    print doproc(g.debugConn, [])


