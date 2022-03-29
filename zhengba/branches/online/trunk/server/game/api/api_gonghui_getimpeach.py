#!/usr/bin/python
#coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g

'''
公会 - 弹劾会长
'''


def proc(conn, data, key=None):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _impeachInfo = g.m.gonghuifun.getImpeachInfo(gud['ghid'])
    if not _impeachInfo:
        _rdata = {'impeach':[],'time':0}
    else:
        _rdata = {'impeach': _impeachInfo['v'], 'time': _impeachInfo['ctime']}
    _res['d'] = _rdata
    return _res

if __name__ == '__main__':
    uid = g.buid("lq02")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc1548ac0911a1710920989'])