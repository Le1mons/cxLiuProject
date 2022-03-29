#!/usr/bin/python
#coding:utf-8
if __name__ == '__main__':
    import sys

    sys.path.append('..')
'''
    聊天 - 打开设置
'''

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s':1}

    uid = conn.uid
    gud = g.getGud(uid)

    # 默认开启 公会，招募，系统
    _rData = g.m.chatfun.getChatSettings(uid)
    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    g.debugConn.uid = "0_5aea7b67625aee5548970d49"
    print doproc(g.debugConn, [])
    # print ifCrossOwner()