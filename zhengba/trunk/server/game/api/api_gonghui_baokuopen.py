#!/usr/bin/python
# coding:utf-8
'''
公会 - 宝库主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'boxdata':[],'buynum':剩余购买次数,'con':充值配置}
        's': 1}

    """
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