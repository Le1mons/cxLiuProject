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

    _con = g.GC['yjkg']['map']
    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,unlockmap,skill".split(','))
    _curMap = _myData['unlockmap'][-1]
    _nextMap = str(int(_curMap) + 1)
    # 已经是最后一个地图了
    if _nextMap not in _con:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    # 技能没有解锁完
    if len(_myData['skill'].get(_curMap,[])) < _con[_nextMap]['skillnum']:
        _res["s"] = -3
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _res['next'] = _nextMap
    _myData['unlockmap'].append(_nextMap)
    _res['map'] = _myData['unlockmap']
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.mdb.update('yjkg',{'uid':uid},{'$push':{'unlockmap':_chkData['next']}})

    _res['d'] = _chkData['map']
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['1', 1])
