#!/usr/bin/python
#coding:utf-8

'''
    聊天 - 打开设置
'''

if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        # 默认开启 公会，招募，系统
        {'d': {'privatechatswitch': '1',
               'shilivoiceswitch': '0',
               'worldvoiceswitch': '1'},
         's': 1}
    """
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

