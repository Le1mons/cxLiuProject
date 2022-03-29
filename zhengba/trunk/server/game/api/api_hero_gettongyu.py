#!/usr/bin/python
# coding:utf-8
'''
英雄--获取统御信息
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        {'d': {'data': {u'2507'统御id: {'maxlv'最大等级: 5, 'mylv'玩家等级: 1}}, 'destinyprize'奖励领取标识: 1}, 's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    if not g.chkOpenCond(uid, 'tonyu'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find('tongyu',{'uid':uid},fields=['_id','maxlv','mylv','tyid'])
    _data = {i['tyid']:{'maxlv':i['maxlv'],'mylv':i['mylv']} for i in _data}
    _destiny = g.getAttrByDate(uid, {'ctype':'destiny_prize'},keys='_id')

    _res['d'] = {'data': _data, 'destinyprize': 1 if _destiny else 0}
    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = [1]

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
