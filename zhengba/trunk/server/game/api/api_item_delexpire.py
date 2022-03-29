#!/usr/bin/python
# coding:utf-8

'''
物品 - 删除过期物品，节日掉落
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

        {"s": 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要删除的物品id
    _itemType = str(data[0])
    # 允许删除的物品类型
    _canDelList = ['5', '8']
    # 物品不在可以删除的canD列表里
    if _itemType not in _canDelList:
        _res['s'] = -1
        _res['errmsg'] = g.L('item_delexpire_res_-1')
        return _res

    # 节日掉落的htype
    _htype = 19
    _hdInfo = g.mdb.find('hdinfo',{'htype': {'$in': [_htype, 45,44]},'etime':{'$lt':g.C.NOW()}},fields=['_id','etime'])
    # 活动不存在
    if not _hdInfo:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_hdnoopen')
        return _res

    _etimeList = map(lambda x:x['etime'] + 24*3600*1, _hdInfo)
    _itemList = g.mdb.find("itemlist",{'usetype':_itemType,'etime':{'$in':_etimeList},'uid':uid},fields={'_id':1})
    # 没有物品
    if not _itemList:
        _res['s'] = -3
        _res['errmsg'] = g.L('item_delexpire_res_-3')
        return _res

    _tidList = map(lambda x:str(x['_id']), _itemList)
    g.m.itemfun.delItem(uid, where={'usetype':_itemType,'etime':{'$in':_etimeList}})
    _sendData = {'item': {i: {'num': 0} for i in _tidList}}
    g.sendChangeInfo(conn, _sendData)

    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = [5]

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
