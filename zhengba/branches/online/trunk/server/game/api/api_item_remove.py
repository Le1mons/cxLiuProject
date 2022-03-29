#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
物品 - 删除物品
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要删除的物品id
    _itemId = data[0]
    # 允许删除的物品
    _canDelList = ['2016']
    # 物品不在可以删除的canD列表里
    if _itemId not in _canDelList:
        _res['s'] = -3
        _res['errmsg'] = g.L('item_remove_res_-3')
        return _res

    # 删除马戏团
    if _itemId == '2016':
        _itemInfo = g.m.itemfun.getItemInfo(uid,_itemId)
        # 物品不存在
        if not _itemInfo:
            _res['s'] = -2
            _res['errmsg'] = g.L('item_remove_res_-2')
            return _res

        _lastTime = _itemInfo['lasttime']
        # _con = [i for i in g.GC['huodong'] if i['hdid'] == 700]
        # _cd = _con[0]['data']['cd']
        # cd还未到
        if g.C.NOW() < _lastTime + 3*24*3600:
            _res['s'] = -1
            _res['errmsg'] = g.L('item_remove_res_-1')
            return _res

        g.m.itemfun.delItem(uid,_itemId)
        _sendData = {'item': {str(_itemInfo['_id']): {'num': 0}}}
        g.sendChangeInfo(conn, _sendData)

    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['2016']
    print doproc(g.debugConn, data)