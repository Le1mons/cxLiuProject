#!/usr/bin/python
# coding:utf-8
'''
商店--打开商店
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [商店id:str， 商品索引:int]
    :return:
    ::

        {'d': {'shop':{
                    'shopitem': [{'isjilu':是否记录，’idx‘:商品索引,'item':商品,'sale':打折信息,'xiyou':是否稀有,'buynum':购买次数,'need':购买商品消耗},'chkvip':购买商品需要的vip等级],
                    'freetime': 免费刷新时间,
                    'autotime': 自动刷新的时间
        }}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 商店id
    shopid = str(data[0])
    _shopData = g.m.shopfun.getShopData(uid, shopid)
    if '_id' in _shopData: del _shopData['_id']

    _cost = g.getAttrByCtype(uid, 'shop_dailyusedcostrfnum', default={})
    _costNum = _cost.get(shopid, 0)
    _res['d'] = {'shop': _shopData,'rfnum':g.m.shopfun.getLessRfNum(uid, shopid), 'costnum':_costNum}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1"])