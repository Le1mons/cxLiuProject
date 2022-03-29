#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 领取目标奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int]
    :return:
    ::

        {'d': {
            'prize':[],
            'reclist':[以领取的层数]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _layer = int(data[0])
    # 等级不足
    if not g.chkOpenCond(uid, 'watcher'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id'])
    # 数据不存在
    if not _data:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 还没有通关
    if _data['winnum'] < _layer:
        _res['s'] = -5
        _res['errmsg'] = g.L('watcher_getprize_-5')
        return _res

    _target = g.m.watcherfun.getWatcherTarget()
    # 奖励已领取
    if _layer not in _target:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _recList = _data.get('reclist', [])
    # 奖励已领取
    if _layer in _recList:
        _res['s'] = -4
        _res['errmsg'] = g.L('watcher_getprize_-4')
        return _res

    _recList.append(_layer)
    g.mdb.update('watcher', {'uid': uid}, {'reclist':_recList})

    _con = g.GC['watchercom']['base']
    _prizeIndex = _target.index(_layer)
    _prize = _con['prize'][_prizeIndex]
    _sendData = g.getPrizeRes(uid, _prize)
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize,'reclist':_recList}

    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [6])