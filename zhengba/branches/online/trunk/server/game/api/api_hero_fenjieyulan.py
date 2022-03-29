#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄--分解预览
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _tidList = data
    _heroTidList = [g.mdb.toObjectId(i) for i in _tidList]
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _heroTidList}})
    # 有一个英雄不存在就返回
    if len(_tidList) != len(_heroList):
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_hecheng_res_-1')
        return _res

    # 返回分解英雄的奖励信息
    _prize = g.m.herofun.getFenjiePrize(uid, _heroList, isyulan=True)
    _equipPrize =  _prize['equip']
    _shipinPrize = _prize['shipin']

    _res['d'] = {'prize': _prize['prize']+_equipPrize+_shipinPrize}
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5bf1d04ae1382335769444ee"])