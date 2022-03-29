#!/usr/bin/python
# coding:utf-8
'''
世界树--打开
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [种族:str]
    :return:
    ::

        {'d':{
            'item': {'fruit':世界树果实,'essence':世界树精华数量},
            'swap':之前转换没有保存的英雄hid
        }
        's': 1}

    """
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

    _hero = g.m.worldtreefun.getSwapHero(uid) or {'hid':''}
    _itemData = {'fruit': _itemid2Num[g.m.worldtreefun.FRUIT_ITEMID], 'essence': _itemid2Num[g.m.worldtreefun.ESSENCE_ITEMID]}
    _res['d'] = {'item':_itemData,'swap':_hero['hid'], "tid":_hero.get("tid","")}

    # 圣诞活动
    g.event.emit('shengdan', uid, {'liwu': ['2']})

    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])