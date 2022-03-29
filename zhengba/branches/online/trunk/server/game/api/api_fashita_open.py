#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
装备 - 合成装备
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid,'fashita'):
        _res['s'] = -1
        _res['errmsg'] = g.L('fashita_open_res_-1')
        return _res

    # 结晶数量
    # _jiejingInfo = g.m.fashitafun.getJieJingNum(uid,getcd=1)

    _fashitaInfo = g.m.fashitafun.getFashitaInfo(uid)
    if not _fashitaInfo:
        _fashitaInfo = {
            'prizelist':[],
            'layernum':0
        }

    _res['d'] = {'fashita': _fashitaInfo}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1012", "1"])