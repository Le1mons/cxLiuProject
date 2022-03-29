#!/usr/bin/python
# coding:utf-8
'''
玩家 - 更换头像
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [头像hid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 玩家新头像hid
    _newAvater = data[0]
    # 获取玩家头像列表
    _avaterList = g.m.userfun.getHeadList(uid)
    _confList = g.GC['zaoxing']['head'].keys()

    # 头像不存在
    if _newAvater not in _avaterList and _newAvater not in _confList:
        _res['s'] = -1
        _res['errmsg'] = g.L('user_changeavater_res_-1')
        return _res

    g.m.userfun.updateUserInfo(uid,{'head':_newAvater},{'act':'user_changeavater'})
    g.sendChangeInfo(conn, {'attr': {'head':_newAvater}})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = ['32013']
    a = doproc(g.debugConn, data)
    print a