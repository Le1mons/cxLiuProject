#!/usr/bin/python
# coding:utf-8
'''
周年庆 - 任务领奖
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

        {"d": {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 等级不符
    if not g.chkOpenCond(uid, 'anniversary'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _tid = str(data[0])
    _con = g.m.anniversaryfun.getCon()['task']
    _myData = g.m.anniversaryfun.getData(uid, _hd['hdid'])
    # 任务未完成
    if not _myData or _myData.get('task', {}).get(_tid,0) < _con[_tid]['pval']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 奖励已领取
    if _myData.get('receive', {}).get(_tid, 0) >= _con[_tid]['num']:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _con
    _chkData['pval'] = _con[_tid]['pval']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _prize = _chkData['con'][data[0]]['prize']

    g.m.anniversaryfun.setData(uid, {'$inc': {'receive.{}'.format(data[0]): 1,'task.{}'.format(data[0]):-_chkData['pval']}}, _chkData['hdid'])

    _send = g.getPrizeRes(uid, _prize, {'act':'anniversary_taskreceive','taskid':data[0]})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': g.m.anniversaryfun.getData(uid, _chkData['hdid'])}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])