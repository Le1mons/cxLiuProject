#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 获取所有雕纹
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'list': [{雕纹tid: {'color':品质,'buff':{},'extbuff':[额外buffid],'lv':等级},'gid':雕纹id,'extskill':技能id，‘recastskill’:重铸的技能id}]}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _result = {}
    _allGlygh = g.mdb.find('glyph',{'uid':uid})
    for i in _allGlygh:
        _result[str(i['_id'])] = i
        del _result[str(i['_id'])]['_id']

    _res['d'] = {'list': _result}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])