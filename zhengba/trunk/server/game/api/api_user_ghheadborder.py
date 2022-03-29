#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
玩家 - 更换头像框
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 玩家新头像框hid
    _hbId = str(data[0])
    # 获取玩家头像列表
    _con = g.GC['zaoxing']['headborder']
    if _hbId not in _con:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    gud = g.getGud(uid)
    # 头像一样
    if _hbId == gud.get('headborder', '1'):
        _res['s'] = -3
        _res['errmsg'] = g.L('user_ghheadborder_-3')
        return _res

    if len(_con[_hbId]['cond']) == 2:
        if gud[_con[_hbId]['cond'][0]] < _con[_hbId]['cond'][1]:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_limit' + _con[_hbId]['cond'][0])
            return _res

    g.m.userfun.updateUserInfo(uid,{'headborder':_hbId},{'act':'user_ghheadborder'})
    g.sendChangeInfo(conn, {'attr': {'headborder':_hbId}})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = ['1']
    a = doproc(g.debugConn, data)
    print a