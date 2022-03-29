#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 选择对手
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [是否刷新:int (1,0)]
    :return:
    ::

        {'d': {'enemy': [对手信息]},
        's': 1}

    """
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
        if i['uid'].startswith('npc'):
            i['defhero'] = [i['defhero']]
            continue
        _head = g.m.userfun.getShowHead(i['uid'])
        i['headdata'] = _head

    _res['d'] = {'enemy': _enemy}
    return _res

if __name__ == '__main__':
    uid = g.buid("3730_5c1ddf5553448018acd678ef")
    g.debugConn.uid = '3380_5c19bedc4383486dee1df0e2'
    print doproc(g.debugConn, data=[1])