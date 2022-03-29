#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
物品 - 获取物品列表
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _itemList = g.m.itemfun.getItemList(uid)

    _nt = g.C.NOW()
    _expireList = []
    _itemMap = {}
    for ele in _itemList:
        _tid = str(ele['_id'])
        del ele["_id"]
        _itemMap[_tid] = ele
        ele.update({'tid': _tid})
        # 处理已过期的usetype 5 的物品
        if ele['usetype'] == '5' and _nt >= ele['etime'] and ele['etime'] not in _expireList:
            _expireList.append(ele['etime'])

    if _expireList:
        g.m.itemfun.delItem(uid, where={'usetype': '5', 'etime': {'$in': _expireList}})

    _res["d"] = {"list": _itemMap}
    return (_res)



if __name__ == '__main__':
    print g.m.itemfun.delItem(g.buid('xuzhao'), where={'usetype': {'$in': ['1','2']}})
    '''
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = '25075'
    # g.m.itemfun.addItem(g.debugConn.uid, data, num=5)
    print doproc(g.debugConn, data=[])
    '''