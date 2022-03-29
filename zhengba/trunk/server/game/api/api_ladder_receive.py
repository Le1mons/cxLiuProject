#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int]
    :return:
    ::

        {'d': {
            'prize': []，
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['ladder']
    gud = g.getGud(uid)
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or gud['lv'] < _con['lv']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _idx = abs((int(data[0])))

    _today = g.getAttrByDate(uid, {'ctype': 'ladder_today'}) or [{'v': {}}]

    # 次数不足
    if _con['prize']['receive'][_idx][0] > _today[0]['v'].get('fight',0) or _con['prize']['receive'][_idx][1] > _today[0]['v'].get('win',0):
        _res["s"] = -2
        _res["errmsg"] = g.L('global_valerr')
        return _res

    # 已领取
    if _idx in _today[0]['v'].get('receive',[]):
        _res["s"] = -3
        _res["errmsg"] = g.L('global_algetprize')
        return _res

    _today[0]['v']['receive'] = _today[0]['v'].get('receive',[]) + [_idx]
    _res['today'] = _today
    _res['prize'] = list(_con['prize']['receive'][_idx][2])
    _res['star'] = _con['prize']['receive'][_idx][3]
    _res['show'] = _con['prize']['receive'][_idx][4]
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    if _chkData['star'] > 0:
        g.crossDB.update('ladder', {"uid": uid, 'key': g.C.getWeekNumByTime(g.C.NOW())},{'$inc': {'star':_chkData['star']}})

    if _chkData['prize']:
        _send = g.getPrizeRes(uid, _chkData['prize'], {'act': 'ladder_receive', 'idx':data[0]})
        g.sendChangeInfo(conn, _send)

    g.setAttr(uid, {'ctype': 'ladder_today'}, {'v': _chkData['today'][0]['v']})

    # _chkData['prize'].append(_chkData['show'])
    _res['d'] = {'prize': _chkData['prize']}
    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[1, 1])
