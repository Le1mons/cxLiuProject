#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
杂货店——购买
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 物品的索引
    _idx = int(data[0])
    _shopInfo = g.m.zahuopufun.getZaHuoPuData(uid)
    # 商品不存在
    if not _shopInfo:
        _res['s'] = -2
        _res['errmsg'] = g.L('zahuopu_buy_res_-2')
        return _res

    _itemInfo =  _shopInfo['shopitem'][_idx]
    _buyNum = _itemInfo['buynum']
    # 商品已售出
    if not _buyNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('zahuopu_buy_res_-1')
        return _res

    _need = _itemInfo['need']
    _sale = _itemInfo['sale']
    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_sale*0.1} for i in _need]
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
    
    _prize = _itemInfo['item']
    _sendData =g.delNeed(uid, _need,logdata={'act': 'zahuopu_buy','shopid':'zhahuopu','prize':_prize})
    g.sendChangeInfo(conn, _sendData)
    # 更 改zahuopu.json中的 buynum次数
    data = {
        '$inc':{'shopitem.{}.buynum'.format(_idx): -1}
    }
    g.m.zahuopufun.setZaHuoPuData(uid, data)

    _prizeData = g.getPrizeRes(uid, [_prize], act='zahuopu_buy')
    g.sendChangeInfo(conn, _prizeData)

    # 神器任务
    g.event.emit('artifact', uid, 'zahuodian')
    # 日常任务监听
    g.event.emit('dailytask', uid, 15)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[3])