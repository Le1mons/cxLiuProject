#!/usr/bin/python
# coding:utf-8
'''
装备 - 获取装备列表
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [职业:str]
    :return:
    ::

        {'d': {'list': {装备tid: {'eid':装备id, 'num':拥有数量, 'usenum':已使用数量,'color':品质,'star':星级}}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _equipList = g.m.equipfun.getEquipList(uid)
    _kMap = {}
    for ele in _equipList:
        _tid = str(ele["_id"])
        del ele["_id"]
        ele.update({'tid': _tid})
        _kMap[_tid] = ele

    _res["d"] = {"list":_kMap}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = []
    _r = doproc(g.debugConn, data)
    print _r