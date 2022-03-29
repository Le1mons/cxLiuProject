#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 查看录像
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'fightres':{}},
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
    _data = g.mdb.find1('zypkjjclog',_w,fields=['_id'])
    # 数据不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('zypkjjc_watch_res_-1')
        return _res

    del _data['enemyuid']; del _data['jifeninfo']

    _res['d'] = _data

    return _res


if __name__ == '__main__':
    uid = g.buid("lsq")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b3b21f4ad23ab3860fe09f4'])