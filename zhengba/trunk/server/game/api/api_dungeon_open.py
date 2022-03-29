#!/usr/bin/python
# coding:utf-8
'''
神殿地牢 - 主界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'recdict': {"1": [第一条路的领奖记录索引]}, 'layer': {"1": 第一条路的层数}, 'num':挑战次数},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _nt = g.C.NOW()
    # 等级不足
    if g.getOpenDay() < 14:
        _res['s'] = -10
        _res['errmsg'] = g.L('dungeon_open_-10', 14-g.getOpenDay())
        return _res

    # 记录今天打开过
    g.setPlayAttrDataNum(uid, 'dungeon_open')
    _data = g.mdb.find1('dungeon',{'uid': uid},fields=['_id','layer','recdict']) or {'layer':{}}
    for i in ('1', '2', '3'):
        _data['layer'][i] = _data['layer'].get(i, 0) + 1

    _res['d'] = {'data': _data}
    _res['d']['num'] = g.m.dungeonfun.getFightNum(uid)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])