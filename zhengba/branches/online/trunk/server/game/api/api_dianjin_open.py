#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
点金主界面
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _resData = {}
    _playattr = g.m.dianjinfun.getDjCD(uid)
    lv = g.getGud(uid)['lv']
    _con = g.GC['dianjin']['type2dianjin']
    _prize = {}
    for i in g.GC['dianjin']['type2dianjin']:
        _prize[i] = _con[i]['prize']
        _prize[i]['n'] = eval(_prize[i]['n'])

    _resData['cd'] = _playattr[0]
    _resData['act'] = _playattr[1]
    _resData['huodongtime'] = g.m.huodongfun.chkZCHDopen('dianjin')
    _resData.update({'prize': _prize})
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    # g.debugConn.uid = g.buid('666')
    uid = g.buid('xuzhao')