#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 领取层数奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
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
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','step','diff','trace','receive'])
    # 数据已存在
    if not _maze:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['mazecom']['base']
    # 还没打完
    if len(_maze['trace']) != _con['level'] or not _maze['trace'][str(_con['level'])]['finish']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_valerr')
        return _res

    # 奖励已领取
    if _maze.get('receive'):
        _res['s'] = -4
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    g.mdb.update('maze',{'uid':uid},{'receive':1,'lasttime':g.C.NOW()})

    _prize = _con['maze'][str(_maze['step'])][_maze['diff']]['prize']
    _send = g.getPrizeRes(uid, _prize, {'act':'maze_receive','step':_maze['step'],'diff':_maze['diff']})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('tk9527')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])