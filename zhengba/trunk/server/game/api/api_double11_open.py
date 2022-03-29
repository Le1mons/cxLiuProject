#!/usr/bin/python
# coding:utf-8
'''
双11庆典 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [是否查看幸运奖池数据:bool]
    :return:
    ::

        {"d": {
                True:
                    log: [{'args':[奖池索引,次数],'name':'','ctime':时间}],
                    v: {奖池索引: {uid: 次数}}
                    send: {奖池索引: [{name:'', svrname:'', uid:''}]} 发奖后才会有这个字段
                False:
                    receive: [已领取奖励得任务id]
                    task: {任务id: 完成次数}
                    exchange: {索引: 兑换次数}
                    libao: {索引: 购买次数}
                    allowance: {索引: 津贴数量}
        }
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
        _chkData['s'] = 1
        _chkData['d'] = {}
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['hd'] = _hd
    _chkData['rtime'] = _hd['rtime']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = g.m.double11fun.getData(uid, _chkData['hdid'], data[0])
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[True])