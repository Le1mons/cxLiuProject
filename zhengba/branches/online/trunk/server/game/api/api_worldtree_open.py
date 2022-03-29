#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
世界树--打开
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _lv = gud['lv']
    # 玩家等级不足
    if not g.chkOpenCond(uid,'worldtree'):
        _res['s'] = -1
        _res['errmsg'] = g.L('worldtree_open_res_-1')
        return _res

    _itemid2Num = g.m.worldtreefun.getFruitAndEssence(uid)


    _itemData = {'fruit': _itemid2Num[g.m.worldtreefun.FRUIT_ITEMID], 'essence': _itemid2Num[g.m.worldtreefun.ESSENCE_ITEMID]}
    _res['d'] = {'item':_itemData}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])