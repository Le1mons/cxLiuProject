#!/usr/bin/python
# coding:utf-8

'''
名将绘卷 - 获取列表
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g



def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _resData = {}
    _resData["info"] = g.m.mjhjfun.getMjhjList(uid)
    _res["d"] = _resData
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("z3")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])