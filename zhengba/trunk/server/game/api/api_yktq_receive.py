#!/usr/bin/python
# coding:utf-8
'''
月卡特权 - 领奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务id:str]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    # 没激活  或者 过期了
    if not g.m.yuekafun.chkMonthlyCardAct(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 今天已经领取了
    if g.getAttrByDate(uid, {'ctype': 'yktq_prize'}):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _przie = g.GC['vip'][str(g.getGud(uid)['vip'])]['tqmonth']
    g.setAttr(uid, {'ctype': 'yktq_prize'}, {'v': 1})
    _send = g.getPrizeRes(uid, _przie, {'act':'yktq_prize'})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _przie}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])