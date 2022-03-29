#!/usr/bin/python
# coding:utf-8
'''
中秋节 - 任务领取
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

        {"d": {
            task: {data:{任务id:完成次数}, rec:[已领奖任务id]}
            moon: 当前经验值
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _taskID = str(data[0])

    _con = g.m.midautumnfun.getCon(_hd['data']['con'])['toTheMoon']['task'][_taskID[0]][_taskID]
    _data = g.m.midautumnfun.getData(uid, _hd['hdid'], _hd['data'].get('con','midautumn'))
    # 任务没有完成
    if _data['task']['data'].get(_taskID, 0) < _con['pval']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 奖励已领取
    if _taskID in _data['task']['rec']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData['hd'] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _taskID = data[0]

    _con = g.m.midautumnfun.getCon(_chkData['hd']['data']['con'])['toTheMoon']
    _prize = list(_con['task'][_taskID[0]][_taskID]['prize'])
    _otherP = []

    # 开始奔月
    for i in _con['moon']:
        if _chkData['data']['moon'] < i[0] <= _chkData['data']['moon'] + _con['task'][_taskID[0]][_taskID]['exp']:
            _otherP += i[1]

    g.m.midautumnfun.setData(uid, _chkData['hdid'], {'$push': {'task.rec': _taskID}, '$inc':{'moon':_con['task'][_taskID[0]][_taskID]['exp']}})

    _send = g.getPrizeRes(uid, _prize + _otherP, {'act': 'midautumn_recieve', 'exp':_chkData['data']['moon']})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    if _otherP:
        _res['d']['other'] = _otherP
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['11'])