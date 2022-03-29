#!/usr/bin/python
# coding:utf-8
'''
装备 - 装备附魔开启界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [职业:str]
    :return:
    ::

        {'d': {'data': {'职业': {'装备部位': 等级}}, 'masterlv': 附魔大师等级}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _res['d'] = g.m.equipfun.getEnchantInfo(uid)
    return _res

if __name__ == "__main__":
    g.mc.flush_all()
    uid = g.buid("hkl123")
    g.debugConn.uid = uid
    data = ['6','1',3]
    _r = doproc(g.debugConn, data)
    print _r