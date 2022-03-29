#!/usr/bin/python
# coding:utf-8
'''
双11 - 任务领奖
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

        {"d": {'prize':[],'data':open数据所有的}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _tid = str(data[0])
    _con = g.m.double11fun.getCon()['task']
    _myData = g.m.double11fun.getData(uid, _hd['hdid'])
    # 任务未完成
    if _myData.get('task', {}).get(_tid,0) < _con[_tid]['pval']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 奖励已领取
    if _tid in _myData.get('receive', []):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _con
    _chkData['data'] = _myData
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _prize = _chkData['con'][data[0]]['prize']

    g.m.double11fun.setData(uid, {'$push': {'receive': data[0]}}, _chkData['hdid'])
    _chkData['data']['receive'].append(data[0])

    _send = g.getPrizeRes(uid, _prize, {'act':'double11_receive','taskid':data[0]})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': _chkData['data']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])