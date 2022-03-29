#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
商店--打开商店
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 商店id
    shopid = str(data[0])
    _shopData = g.m.shopfun.getShopData(uid, shopid)
    if '_id' in _shopData: del _shopData['_id']
    _res['d'] = {'shop': _shopData}
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1"])