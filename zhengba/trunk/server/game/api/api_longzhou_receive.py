#!/usr/bin/python
# coding:utf-8
'''
龙舟活动 - 任务领取
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:  参数[taskid]
    :return:
    ::

        {'d': {'allnum': 0,   参与活动的总人数
           'info': {u'data': {},
                    u'etime': 1621612800,
                    u'hdid': 1621303915,
                    u'rtime': 1621612800,
                    u'stime': 1621180800},
           'myinfo': {'date': '2021-05-19',
                      'duihuan': {}, 兑换情况
                      'info': {},
                      'libao': {},  礼包情况
                      'num': 0,    今日投票数量
                      'select': '',   选择的龙舟id
                      'task': {'data': {'1': 1}, 'rec': []}}},  任务完成情况
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(74, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    _taskID = str(data[0])

    _con = g.m.longzhoufun.getCon()['task'][_taskID]
    _data = g.m.longzhoufun.getData(uid, _hd['hdid'])
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
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _taskID = str(data[0])
    _taskCon = g.m.longzhoufun.getCon()
    _con = _taskCon['task'][_taskID]


    _otherP = []
    _yanhua = 0
    _data = _chkData["data"]

    _prize = _con["prize"]
    _data["task"]["rec"].append(_taskID)
    # 设置任务领奖
    g.m.longzhoufun.setData(uid, _chkData['hdid'], {'task': _data["task"]})
    _send = g.getPrizeRes(uid, _prize, {'act': 'longzhouhd_recieve', 'taskid':_taskID})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = [1]
    g.debugConn.argv = _data
    g.debugConn.run()