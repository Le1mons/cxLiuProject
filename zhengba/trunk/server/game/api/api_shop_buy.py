#!/usr/bin/python
# coding:utf-8
'''
商店--购买物品
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [商店id:str， 商品索引:int]
    :return:
    ::

        {'d': {'shopinfo':商品信息 参照open}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 商店的id
    _shopId = str(data[0])
    # 商品的索引
    _idx = int(data[1])
    # 购买数量
    _num = 1
    if len(data) >= 3:
        _num = abs(data[2])

    _shopInfo = g.m.shopfun.getShopData(uid, _shopId)

    _itemInfo =  _shopInfo['shopitem'][_idx]
    _buyNum = _itemInfo['buynum']
    # 商品已售出
    if _buyNum != -1 and _buyNum < _num:
        _res['s'] = -1
        _res['errmsg'] = g.L('zahuopu_buy_res_-1')
        return _res

    # 开区天数不足
    if 'openday' in _itemInfo and _itemInfo['openday'] > g.getOpenDay():
        _res['s'] = -11
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 如果有etime 就判断etime
    if 'etime' in _itemInfo and g.C.NOW() > _itemInfo['etime']:
        _res['s'] = -3
        _res['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _res

    _sale = _itemInfo['sale']
    _need = g.C.dcopy(_itemInfo['need'])
    for i in _need:
        i['n'] *= _sale*0.1*_num
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res
    
    _prize = [{'a':_itemInfo['item']['a'], 't': _itemInfo['item']['t'], 'n':_itemInfo['item']['n']*_num}]

    _sendData =g.delNeed(uid, _need,logdata={'act': 'shop_buy','shopid':_shopId,'prize':_prize,'need':_need})
    g.sendChangeInfo(conn, _sendData)
    # 更 改shops中的 buynum次数
    if _buyNum != -1:
        _shopInfo['shopitem'][_idx]['buynum'] -= _num
        g.m.shopfun.setShopData(uid, _shopId, _shopInfo)

    _prizeData = g.getPrizeRes(uid, _prize, {'act':'shop_buy'})
    g.sendChangeInfo(conn, _prizeData)
    _res['d'] = {'shopinfo': _shopInfo}
    return _res


if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[4, 8])