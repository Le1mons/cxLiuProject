#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
试炼之塔 - 开启
'''
def proc(conn, data,key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _data = g.m.shilianztfun.getData(uid)

    _resData = {}
    _resData["mydata"] = _data
    _resData["reclist"] = g.m.shilianztfun.getTaskRec(uid)
    _resData["foeverreclist"] = g.m.shilianztfun.getFoeverTaskRec(uid)
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('9')
    g.debugConn.uid = uid
    _data = []
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'