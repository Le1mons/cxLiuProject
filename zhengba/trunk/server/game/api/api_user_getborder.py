#!/usr/bin/python
# coding:utf-8
'''
玩家 - 获取头像框 或者聊天框
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [框的类型:str('head','chat')]
    :return:
    ::

        {'d': {'time': {框的id: 过期时间}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 获取哪个框
    _type = data[0]
    # 只能获取头像框或者聊天框
    if _type not in ('head', 'chat'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _data = g.getAttrOne(uid, {'ctype': _type + 'border_list'}, keys='_id,time,v')
    if not _data:
        _data = {'v':[],'time':{}}

    _res['d'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = ['1']
    a = doproc(g.debugConn, data)
    print a