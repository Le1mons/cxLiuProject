#!/usr/bin/python
#coding:utf-8
'''
每日首充--领取奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
import huodong
def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid

    _idx = abs(int(data[0]))
    _scData = g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive')
    # 没有今日充值信息
    if not _scData:
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsc_getprize_-1')
        return _res

    _con = g.GC['meirishouchong']['data'][g.m.shouchongfun.getKey()][_idx]
    _val = _scData[0]['v']
    # 充值金额不足以领取
    if _val < _con['val']:
        _res['s'] = -2
        _res['errmsg'] = g.L('mrsc_getprize_-2')
        return _res

    # 奖励已领取
    if _idx in _scData[0].get('receive',[]):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    g.setAttr(uid, {'ctype': 'meirishouchong'}, {'$push': {'receive': _idx}})
    _prize = _con['prize']
    _sendData = g.getPrizeRes(uid, _prize, {'act':'mrsc_getprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _r = doproc(g.debugConn, [1])
    print _r