#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 获取精炼进度数
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _res['d'] = g.getAttrByCtype(uid, 'glyph_refinenum', default=0, bydate=False)
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5c274032c0911a314805e73f", "5bd75c81cc20f32f18048cc5", 1])