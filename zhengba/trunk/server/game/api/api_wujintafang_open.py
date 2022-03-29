#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
无尽塔防-open
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    # 判断是否开启
    if not g.chkOpenCond(uid, 'wujinzhita'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData


    #  当前层数

    _resData["myinfo"] = g.m.wujinzhitafun.getUserData(uid)
    # 地图信息
    _resData["mapinfo"] = g.m.wujinzhitafun.getChkData(uid)
    _res["d"] = _resData

    return _res






if __name__ == '__main__':

    g.debugConn.uid = g.buid('lsq0')
    from pprint import pprint

    _data = ['0_5aec54eb625aee6374e25dff']
    pprint (doproc(g.debugConn,_data))