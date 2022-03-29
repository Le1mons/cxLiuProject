#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄--获取统御信息
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    if not g.chkOpenCond(uid, 'tonyu'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find('tongyu',{'uid':uid},fields=['_id','maxlv','mylv','tyid'])
    _data = {i['tyid']:{'maxlv':i['maxlv'],'mylv':i['mylv']} for i in _data}
    _destiny = g.getAttrByDate(uid, {'ctype':'destiny_prize'},keys='_id')

    _res['d'] = {'data': _data, 'destinyprize': 1 if _destiny else 0}
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5bbf19d7c0911a331c3cb262",'5bbf19d7c0911a331c3cb262'])