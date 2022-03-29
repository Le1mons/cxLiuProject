#!/usr/bin/env python
# coding:utf-8
 
'''
    巅峰王者 - 钻石赛打开接口
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'mygroup': 我的组别,
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s' : 1}
    uid = conn.uid
    gud = g.getGud(uid)

    # 本周活动未开启
    _ifopen = g.m.crosswzfun.isWangZheOpen()
    if not _ifopen:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    # 是否已开赛
    _status = g.m.crosswzfun.getWangZheStatus()
    if _status < 5:
        _res['s'] = -1
        _res['errmsg'] = g.L('crosswz_zssopen_-1')
        return _res

    _dkey = g.m.crosswzfun.getDKey()
    _where = {"dkey": _dkey, "uid": uid}
    _res['d'] = {}
    _r = g.crossDB.find('wzfight', _where, fields=['_id','groupid'])
    if _r:
        _res['d'] = {'mygroup': _r[0]['groupid']}
    
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('gch')
    print doproc(g.debugConn,[1])
