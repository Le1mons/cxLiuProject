#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
聊天-发送战斗录像
'''

def proc(conn, data, key=None):
    """

    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(conn, data):
    uid = conn.uid
    _chkData = {}
    _chkData["s"] = 1
    # 0是世界，1是跨服
    _fighKey = str(data[0])

    _fightData = None
    _chk = g.crossMC.get(_fighKey)
    if _chk:
        _fightData = g.crossDB.find1("chat_video", {"uuid": _fighKey})

    # 数据不存在
    if not _fightData:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('chat_watch_res_-1')
        return _chkData
    _chkData["fightdata"] = _fightData["fightres"]

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(conn, data)
    if _chkData["s"] != 1:
        return _chkData

    _fightData = _chkData["fightdata"]
    _res["d"] = _fightData
    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('wlx1')
    g.debugConn.uid = uid
    _data = ['"fightlog_8c513dde"']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'