#!/usr/bin/python
# coding:utf-8
'''
神殿地牢 - 录像获取
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [哪条路:str, 哪一层:int]
    :return:
    ::

        {'d': {'zhanli': 战力,
                'fightres': {},
                'step':层数
                },
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'dungeon'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 哪条路
    _road = str(data[0])
    # 层数
    _step = int(data[1])

    _logs = g.mdb.find('dungeonlog', {'road':_road,'step':_step},fields={'_id':0})
    _res['d'] = _logs
    return _res

if __name__ == '__main__':
    uid = g.buid("design9999")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [3,1])