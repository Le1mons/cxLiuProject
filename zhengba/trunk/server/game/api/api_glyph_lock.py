#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 雕纹锁定
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [雕纹tid:str]
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
    # 雕纹的_id
    _gid = data[0]
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id','lock'])
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    g.m.glyphfun.setGlyphInfo(uid, _gid, {'lock': not _data.get('lock', False)})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=['5c29c0d7c0911a34646baeab'])
    print g.C.getWeekNumByTime(g.C.NOW())