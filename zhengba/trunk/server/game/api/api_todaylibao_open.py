#!/usr/bin/python
# coding:utf-8
'''
每日基础礼包 - 打开
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data:
    :param key:
    :return:
    ::

       {'d': {0 配置的key: 0显示可以购买的索引  超过索引就说明买完了}
       's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 判断是否开启
    # if not g.m.todaylibaofun.isOpen(uid):
    #     _chkData['s'] = -1
        # _chkData['errmsg'] = g.L('global_noopen')
        # return _chkData

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _data = g.m.todaylibaofun.getToDayLiBao(uid)
    _res["d"] = _data
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = ['2']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'