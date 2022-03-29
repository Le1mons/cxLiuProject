#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 移除派遣
'''

def proc(conn, data, key=None):
    """


    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _tid = str(data[0])

    # 获取当前玩家派遣武将列表
    _dispatchData, name = g.m.jibanfun.getDispatchHero(uid)
    # 判断移除的武将是否在派遣列表中
    if _tid not in _dispatchData:
        #  武将不存在
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_heroerr')
        return _chkData

    _chkData["dispatchData"] = _dispatchData
    _chkData["tid"] = _tid
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = []
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _tid = _chkData["tid"]
    _dispatchData = _chkData["dispatchData"]
    # 删除这个英雄
    del _dispatchData[_tid]
    g.m.jibanfun.setDispatchHero(uid, _dispatchData)

    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = ['5dc3c0709dc6d614e84d3b1b']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'