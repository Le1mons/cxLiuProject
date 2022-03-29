#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
公用接口 -- 查看信息
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要查看的类别
    _type = data[0]
    # 要查看玩家的uid
    _uid = data[1]
    gud = g.getGud(_uid)
    # 数据不存在
    if not gud:
        _res['s'] = -1
        _res['errmsg'] = g.L('user_details_res_-1')
        return _res

    _resData = {}
    _resData['ghid'] = gud['ghid']
    _resData['ghname'] = gud['ghname']
    _resData['ghpower'] = gud['ghpower']
    _resData['zhanli'] = gud['maxzhanli']
    _resData['isfriend'] = 0
    _resData['isshield'] = 0
    _resData['headdata'] = g.m.userfun.getShowHead(_uid)
    if _type == 'zypkjjc':
        _info = g.mdb.find1('zypkjjc',{'uid':_uid})
        if _info: _resData['zhanli'] = _info['zhanli']

    _friends = g.m.friendfun.getFriendList(uid)
    _otherFriends = g.m.friendfun.getFriendList(_uid)
    if _uid in _friends:
        _resData['isfriend'] = 1
    _shields = g.m.friendfun.getShieldList(uid)
    if _uid in _shields:
        _resData['isshield'] = 1

    _resHero = g.m.userfun.getDefHeroInfo(_uid, _type)
    _resData['defhero'] = _resHero
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["championtrial","0_5aec54eb625aeef374e25e16"]
)