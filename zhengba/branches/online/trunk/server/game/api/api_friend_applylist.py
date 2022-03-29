# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——查看申请列表
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _applyList = g.m.friendfun.getApplyList(uid)
    _applyList = map(g.m.userfun.getShowHead, _applyList)

    _res['d'] = {'applylist': _applyList}
    return _res

if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    print doproc(g.debugConn,["0_5b54c57de1382312f766903c"])