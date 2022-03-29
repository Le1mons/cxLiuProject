#!/usr/bin/python
# coding:utf-8
'''
商店--刷新商店
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [商店id:str]
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
    # 商店id
    _shopId = data[0]
    _rfNum = g.m.shopfun.getLessRfNum(uid, _shopId)
    if _rfNum <= 0:
        _con = g.GC['shop'][_shopId]
        # 不能消耗刷新
        _need = _con['need']
        if not _need:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_numerr')
            return _res

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

        # 每日消耗刷新次数
        if _con['dailycostnum'] != -1:
            _usedNum = g.getAttrByCtype(uid, 'shop_dailyusedcostrfnum', default={})
            if _con['dailycostnum'] <= _usedNum.get(_shopId, 0):
                _res['s'] = -2
                _res['errmsg'] = g.L('global_numerr')
                return _res

            _usedNum[_shopId] = _usedNum.get(_shopId, 0) + 1
            g.setAttr(uid, {'ctype': 'shop_dailyusedcostrfnum'}, {'v': _usedNum})


        _sendData = g.delNeed(uid, _need, logdata={'act': 'shop_shuaxin'})
        g.sendChangeInfo(conn, _sendData)
    else:
        _rfNum -= 1
        _maxNum = g.GC['shop'][_shopId]['dailyrfnum']
        g.setAttr(uid, {'ctype': 'shop_dailyusedrfnum'}, {'$set': {'v.{}'.format(_shopId):  _maxNum - _rfNum}})

    _data = g.m.shopfun.getShopData(uid, _shopId, isref=1)

    _res['d'] = {'shopinfo':_data}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])