#!/usr/bin/python
# coding:utf-8
'''
冠军试练 - 查看录像
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [录像tid:{}]
    :return:
    ::

        {'d': {战斗信息}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 录像的tid
    _tid = data[0]
    _w = {'_id':g.mdb.toObjectId(_tid)}
    _data = g.mdb.find1('ctlog',_w,fields=['_id'])
    # 数据不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('championtrial_watch_res_-1')
        return _res

    _data['headdata'] = g.m.userfun.getShowHead(_data['enemyuid'])
    del _data['jifeninfo']; del _data['enemyuid']
    _res['d'] = _data

    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b2a5a02c0911a2b1479cfe1'])