#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
商店--刷新商店
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 商店id
    _shopId = data[0]
    _shopInfo = g.m.shopfun.getShopData(uid, _shopId)
    _nt = g.C.NOW()
    _freetime = _shopInfo.get('freetime')
    # 存在freetime 但是 当前时间小于freetime
    if _freetime == -1 or _nt < _freetime:
        _shopCon = g.m.shopfun.getShopCon(_shopId)
        _need = _shopCon['need']
        # 该商店不允许刷新
        if not _need and _freetime == -1 and not _shopCon['rtimes']:
            _res['s'] = -1
            _res['errmsg'] = g.L('shop_shuaxin_res_-1')
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
        _sendData = g.delNeed(uid, _need,logdata={'act': 'shop_shuaxin'})
        g.sendChangeInfo(conn, _sendData)

    _data = g.m.shopfun.getShopData(uid, _shopId, isref=1)

    _res['d'] = {'shopinfo':_data}
    return _res

if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['4'])