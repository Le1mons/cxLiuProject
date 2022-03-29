#!/usr/bin/python
# coding:utf-8
'''
许愿池--查看中奖记录
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [许愿池类型:str]
    :return:
    ::

        {'d': {'许愿池类型':[{'username':玩家名字,'ctime':时间,'prize':[]'}]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    _type = data[0]
    _jiluList = g.m.xuyuanchifun.getXYCjilu( _type)

    _res['d'] = {_type: _jiluList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['common'])