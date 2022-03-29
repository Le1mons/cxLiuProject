#!/usr/bin/python
# coding:utf-8

'''
物品 - 转换
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        {'d': {'prize': [{'a': 'item', 'n': 10, 't': '4009'}]}, 's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _id = data[0]
    # 参数错误
    if not g.GC['item'][_id]['hchero'] or g.GC['item'][_id]['usetype'] != '12':
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _item = g.m.itemfun.getItemNum(uid, _id)
    # 不能兑换
    if _item >= int(g.GC['item'][_id]['hcnum']):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    if _item == 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_itemless')
        return _res

    _del = g.delNeed(uid,[{'a':'item','t':_id,'n':_item}],0,{'act': 'item_change'})
    g.sendChangeInfo(conn, _del)

    _resId = '4009'
    _prize = [{'a':'item','t':_resId,'n':_item}]
    _send = g.getPrizeRes(uid, _prize, {'act': 'item_change'})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize}
    return (_res)


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['41013']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
