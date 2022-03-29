#!/usr/bin/python
# coding:utf-8

'''
武魂 - 列表
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

        {"d":{"tid": {'lv':等级,'id':武魂id,'wearer':穿戴者tid}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _data = g.mdb.find('wuhun', {'uid': uid}, fields={'uid':0})
    _res['d'] = {}
    for i in _data:
        _res['d'][str(i.pop('_id'))] = i
    return _res

if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = []
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'