#!/usr/bin/python
# coding:utf-8
'''
三周年 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(80, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _res['d'] = {"myinfo": g.m.herothemefun.getData(uid, _chkData['hdid']), "ranklist": g.m.herothemefun.getRanklist(uid, _chkData["hdid"], limit=3)}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=['1', 1]))
