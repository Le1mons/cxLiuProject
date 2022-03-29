#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 宝库主界面
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res

    _boxCanBuyNum = g.m.gonghuifun.getBoxCanBuyNum(_ghid)
    _boxData = g.m.gonghuifun.getGonghuiBoxData(_ghid)
    # 前端购买需要使用
    _gameVer = g.getGameVer()
    # 支付配置
    _payConJSON = g.m.payfun.getPayCon("paycon")[_gameVer]
    _res['d'] = {'boxdata':_boxData, 'buynum':_boxCanBuyNum, "con": _payConJSON['ghbx648']}
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, [])