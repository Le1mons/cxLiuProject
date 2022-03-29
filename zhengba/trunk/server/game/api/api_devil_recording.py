#!/usr/bin/python
# coding:utf-8
'''
神殿魔王 -  打开界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要观看得录像作者uid:str]
    :return:
    ::

        {'d': {fightres {}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 要观看得录像作者
    _uid = data[0]
    _recording = g.m.devilfun.GATTR.getAttrOne(_uid, {'ctype': 'temple_devil_recording'})
    # 录像不存在
    if not _recording:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _res['d'] = _recording['v']
    return _res

if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid("lsq333")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, [])
    pprint(a)