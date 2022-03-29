#!/usr/bin/python
# coding:utf-8

'''
终生卡
'''
import g



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _con = g.GC['lifetimecard']
    if g.getOpenDay() < _con['day']:
        return

    if act != _con['proid']:
        return

    gud = g.getGud(uid)
    if gud['lifetimecard'] == 1:
        return

    gud['lifetimecard'] = 1
    g.m.gud.setGud(uid, gud)
    g.mdb.update('userinfo', {'uid': uid}, {'lifetimecard': 1})
    _send = {'attr': {'lifetimecard': 1}}

    _prize = _con['buyprize']
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'lifetimecard'})
    g.mergeDict(_send, _sendData)
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHD(uid):
    _con = g.GC['lifetimecard']
    # 功能没有开启  或者 没有激活
    if g.getOpenDay() < _con['day'] or not g.getGud(uid).get('lifetimecard'):
        return 0

    if not g.getPlayAttrDataNum(uid, 'lifetimecard_prize'):
        return 1

    return 0


# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)

if __name__ == '__main__':
    print getHongDian(g.buid('xuzhao'))