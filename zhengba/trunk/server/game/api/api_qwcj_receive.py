#!/usr/bin/python
# coding:utf-8
'''
趣味成就 - 领奖
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

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 任务id
    _tid = data[0]
    _qwcj = g.m.qwcjfun.getQwcjData(uid)
    _con = g.GC['qwcj'][_tid]
    # 任务没完成
    if _tid not in _qwcj['nval'] or _qwcj['nval'][_tid] < _con['pval']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 奖励已领取
    if _tid in _qwcj.get('receive', []):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['prize'] = _con['prize']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.mdb.update('qwcj', {'uid': uid}, {'$push': {'receive': data[0]}})

    _send = g.getPrizeRes(uid, _chkData['prize'], {'act': 'qwcj_receive', 'tid': data[0]})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _chkData['prize']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['3'])