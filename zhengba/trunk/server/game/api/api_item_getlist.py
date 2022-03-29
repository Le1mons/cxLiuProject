#!/usr/bin/python
# coding:utf-8
'''
物品 - 获取物品列表
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

        {'d': {'list'物品列表: {'5d2d985b0ae9fe3a60067948'物品tid: {u'bagtype': u'2',
                                                     u'color': 3,
                                                     u'ctime': 1563269211,
                                                     u'itemid': u'2007',
                                                     u'lasttime': 1563351373,
                                                     u'name': u'\u8f6c\u76d8\u5e01',
                                                     u'num': 5,
                                                     'tid': '5d2d985b0ae9fe3a60067948',
                                                     u'uid': u'0_5d2d985b0ae9fe3a6006791d',
                                                     u'usetype': u'10'}}},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _itemList = g.m.itemfun.getItemList(uid)

    # 要删除的usetype 列表
    _delTypes = ['5', '8', '13']

    _nt = g.C.NOW()
    _expireList = []
    _itemMap = {}
    for ele in _itemList:
        _tid = str(ele['_id'])
        del ele["_id"]
        _itemMap[_tid] = ele
        ele.update({'tid': _tid})
        # 处理已过期的usetype 5 的物品
        if ele['usetype'] in _delTypes and _nt >= ele['etime'] and ele['etime'] not in _expireList:
            _expireList.append(ele['etime'])

    if _expireList:
        g.m.itemfun.delItem(uid, where={'usetype': {'$in':_delTypes}, 'etime': {'$in': _expireList}})

    _res["d"] = {"list": _itemMap}
    return (_res)

if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    data = ['2016']
    print doproc(g.debugConn, data)
