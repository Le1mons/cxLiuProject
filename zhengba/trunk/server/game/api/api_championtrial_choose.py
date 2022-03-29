#!/usr/bin/python
# coding:utf-8
'''
冠军的试练 - 选择对手
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [是否刷新:bool]
    :return:
    ::

        {'d': {'list':[
                {uid:'','defhero':[{'第一队站位1':英雄tid}], 'headdata':{玩家头像信息}}
                        ]}
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
    _enemyList = g.m.championfun.getPkUserList(uid)
    if not _enemyList or _isref:
        _enemyList = g.m.championfun.refPkUser(uid)
        g.m.championfun.setPkUserList(uid,_enemyList)

    for i in _enemyList:
        if '_id' in i: del i['_id']
        _head = g.m.userfun.getShowHead(i['uid'])
        i['headdata'] = _head

    _res['d'] = {'list': _enemyList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])