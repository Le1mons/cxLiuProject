#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g

'''
    获取月基金活动相关数据
'''

import huodong


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # _rdata = g.m.huodongfun.getMonthFundInfo(uid)
    _rdata = huodong.monthfund.getMonthFundInfo(uid)
    _res['d'] = _rdata
    return _res


if __name__ == '__main__':
    uid = g.buid('liu9104')
    g.debugConn.uid = uid
    _r = doproc(g.debugConn, [])
    print _r
