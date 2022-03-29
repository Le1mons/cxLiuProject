#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄--获取天命奖励
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    if not g.chkOpenCond(uid, 'tonyu'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.getAttrByDate(uid, {'ctype':'destiny_prize'})
    # 奖励已领取
    if _data:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _prize = g.m.herofun.getDestinyData(g.getGud(uid).get('destiny',0))['prize']
    # 没有可以领取的奖励
    if not _prize:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_gettmprize_-3')
        return _res

    g.setAttr(uid,{'ctype':'destiny_prize'},{'v':1})
    _sendData = g.getPrizeRes(uid, _prize,act={'act':'hero_gettmprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5bbf19d7c0911a331c3cb262",'5bbf19d7c0911a331c3cb262'])