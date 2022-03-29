#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 查看英雄数据
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _tid = data[0]
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','growbuff','cd'])
    # 数据已存在
    if _maze is None or g.C.NOW() >= _maze['cd']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _maze = g.m.mazefun.getMazeHeroFightdata(uid, [_tid], _maze.get('growbuff',{}), _maze.get('growbuff',{}))
    # 数据不存在
    if not _maze:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _res['d'] = _maze[0]
    return _res

if __name__ == '__main__':
    uid = g.buid('jingqi_1903121348302519')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['5c970ac8644a610a8f5dae14'])