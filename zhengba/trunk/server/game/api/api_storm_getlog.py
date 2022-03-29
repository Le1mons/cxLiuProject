#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 日志记录
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [哪个区:str, 第几座要塞:int]
    :return:
    ::

        {"d":[{'desc':日志的内容,'headdata':{},'ctime':时间}]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.m.stormfun.getLogList(uid)

    _res['d'] = _data
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('design9999')
    print doproc(g.debugConn, data=[])