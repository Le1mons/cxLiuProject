#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公会争锋 - 王者信息
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 要查看的赛季
    _season = int(data[0])
    _data = g.crossDB.find('competing_toplog',{'season':_season},fields=['_id'])
    _res['d'] = _data

    return _res

if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])