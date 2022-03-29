#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

'''
竞技场 - 选择对手
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 是否刷新
    _isref = int(data[0])
    _data = g.m.zypkjjcfun.getPkUserList(uid)
    if not _data or _isref:
        _enemy = g.m.zypkjjcfun.refPkUser(uid)
        g.m.zypkjjcfun.setPkUserList(uid,_enemy)
    else:
        _enemy = _data[0]['v']

    for i in _enemy:
        if '_id' in i: del i['_id']
        _head = g.m.userfun.getShowHead(i['uid'])
        del i['uid']
        i['headdata'] = _head

    _res['d'] = {'enemy': _enemy}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq12")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])