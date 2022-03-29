#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 获取精炼进度奖励
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

        {'d': 'prize': []
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
    _num = g.getAttrByCtype(uid, 'glyph_refinenum', default=0, bydate=False)
    _con = g.GC['glyphcom']['base']
    _maxNum = _con['refinenum']
    # 次数不够
    if _num < _maxNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_valerr')
        return _res


    g.m.glyphfun.addRefineNum(uid, -_maxNum)
    _prize = _con['refineprize']
    _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_getrefineprize'})
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5c274032c0911a314805e73f", "5bd75c81cc20f32f18048cc5", 1])