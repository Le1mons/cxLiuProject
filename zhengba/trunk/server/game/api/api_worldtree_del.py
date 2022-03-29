#!/usr/bin/python
# coding:utf-8
'''
世界树--删除
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 玩家等级不足
    if not g.chkOpenCond(uid,'worldtree'):
        _res['s'] = -1
        _res['errmsg'] = g.L('worldtree_open_res_-1')
        return _res

    g.delAttr(uid, {'ctype': 'worldtree_swap'})
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])