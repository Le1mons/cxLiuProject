#!/usr/bin/python
#coding:utf-8

'''
    聊天 - 修改配置
'''


if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [stype]  stype:'zhaopin','gonghui','xitong'
    :return:
    ::

        {'d': u'zhaopin', 's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s':1}

    uid = conn.uid
    gud = g.getGud(uid)
    stype = str(data[0])
    if stype not in ('zhaopin','gonghui','xitong'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    g.m.chatfun.setChatSettings(uid, stype)
    _res['d'] = g.m.chatfun.getChatSettings(uid)
    return _res

