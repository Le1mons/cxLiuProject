#!/usr/bin/python
# coding:utf-8
'''
遗迹考古 - 打开界面
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

        {'d': {
            'unlockmap': [解锁区域id]，
            'key': 上次免费购买珍贵宝箱的日期，
            ‘yiqi’：{speed:速度仪器等级，exp:经验仪器等级},
            'farthest':{"1":区域1 最远考古距离},
            'data': { 空表示没有考古

            },
            'exp': {”1“:区域1的经验},
            "energe":{"1":区域1的能源},
            "skill":{"1":[区域1已学习的技能]}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = g.m.yjkgfun.getMyData(uid, fields={'_id':0,'uid':0})
    _res['d']['free'] = _res['d']['key'] != g.C.DATE()
    return _res


if __name__ == '__main__':
    uid = g.buid('wlx')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
