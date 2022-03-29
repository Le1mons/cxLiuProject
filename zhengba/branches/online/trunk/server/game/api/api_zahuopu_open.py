#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')
sys.path.append('game')
import g

'''
杂货店——开启
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _data = g.m.zahuopufun.getZaHuoPuData(uid)
    _freetime = _data.get('freetime', 0) #g.C.NOW()
    _shopItem = _data['shopitem']
    _temp = g.getAttrOne(uid,{'ctype':'zahuopu_rfnum'})
    _nt = g.C.NOW()
    _freeInfos = g.m.zahuopufun.getRfNum(uid, getcd=1)
    _freeInfos['freetime'] += 2*3600
    _freeInfos.update({'itemlist':_shopItem})
    _res['d'] = _freeInfos
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])

