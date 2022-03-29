#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 获取所有雕纹
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _result = {}
    _allGlygh = g.mdb.find('glyph',{'uid':uid})
    for i in _allGlygh:
        _result[str(i['_id'])] = i
        del _result[str(i['_id'])]['_id']

    _res['d'] = {'list': _result}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])