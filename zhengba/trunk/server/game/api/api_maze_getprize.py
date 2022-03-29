#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 领取里程碑奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [排序id:str]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _lid = str(data[0])
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','total','reclist','cd'])
    # 数据已存在
    if not _maze or g.C.NOW() >= _maze['cd'] or 'total' not in _maze:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['mazecom']['base']['landmark']
    # 参数错误
    if _lid not in _con:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 奖励已领取
    if _lid in _maze.get('reclist', []):
        _res['s'] = -5
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    # 条件不满足
    if _maze['total'][_con[_lid]['cond']['diff']] < _con[_lid]['cond']['num']:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_valerr')
        return _res

    g.mdb.update('maze', {'uid': uid}, {'$push': {'reclist': _lid},'$set':{'lasttime':g.C.NOW()}})
    _prize = _con[_lid]['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': 'maze_getprize', 'lid': _lid})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('lyf')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['1'])