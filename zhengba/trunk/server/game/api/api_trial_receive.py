#!/usr/bin/python
# coding:utf-8
'''
试炼活动 - 领奖
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
    _chkData = {}
    # 任务id
    _tid = str(data[0])
    # 开区天数
    _day = g.getOpenDay()
    _con = g.m.trialfun.getCon()
    _type = ''
    for i in _con:
        if _con[i]['day'][0] <= _day <= _con[i]['day'][1]:
            _type = i
            break
    else:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _data = g.m.trialfun.getDataByType(uid, _type)
    # 任务没完成
    if _tid not in _data['task'] or _data['task'][_tid] < _con[_type]['task'][_tid]['pval']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 奖励已领取
    if _tid in _data.get('receive', []):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['prize'] = _con[_type]['task'][_tid]['prize']
    _chkData['type'] = _type
    _chkData['tid'] = _tid
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _przie = _chkData['prize']
    _type = _chkData['type']
    g.mdb.update('trial',{'uid': uid, 'type':_type}, {'$push': {'receive': _chkData['tid']}})
    _send = g.getPrizeRes(uid, _przie, {'act':'trial_receive','taskid':data[0]})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _przie}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])