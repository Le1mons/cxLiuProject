#!/usr/bin/python
# coding:utf-8
'''
每日试练——开启
'''

import sys

sys.path.append('..')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str('hero','exp','jinbi')]
    :return:
    ::

        {"d": {'buynum': 剩余购买次数,'_lessNum':剩余次数,'maxnum':最大次数}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _type = str(data[0])
    # 等级不足
    if not g.chkOpenCond(uid,'meirishilian'):
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsl_open_res_-1')
        return _res

    _lessNum = g.m.mrslfun.getLessNum(uid, _type)
    _maxNum = g.m.mrslfun.getMaxBuyNum(uid)
    _buyNum = g.m.mrslfun.getBuyNum(uid,_type)
    # 扫荡信息
    _data = g.getAttrOne(uid, {'ctype': 'dailytrain_sweeping'}, keys='_id,v') or {'v': {}}
    _res['d'] = {'lessnum': _lessNum, 'maxnum': _maxNum,'buynum':_buyNum,'sweeping':_data['v']}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao1')
    print doproc(g.debugConn, ['jinbi', 1])