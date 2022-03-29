#!/usr/bin/python
# coding: utf-8
'''
好友——黑名单
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"blacklist": [{headdata}]
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _data = g.mdb.find1('friend',{'uid': uid},fields=['_id', 'shield'])

    _resData = []
    if _data:
        _all = g.crossDB.find('cross_friend', {'uid': {'$in': _data['shield']}, 'head': {'$exists': 1}},fields=['_id','head','uid'])
        _head = {i.pop('uid'): i['head'] for i in _all}
        for _uid in _data['shield']:
            if g.m.crosscomfun.chkIsThisService(_uid):
                _resData.append(g.m.userfun.getShowHead(_uid))
            elif _uid in _head:
                _resData.append(_head[_uid])

    _res['d'] = {'blacklist': _resData}
    return _res

    
if __name__ == '__main__':
    uid = g.buid("jingqi_1812192350271292")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1012","1"])