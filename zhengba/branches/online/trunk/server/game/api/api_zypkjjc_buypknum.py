#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

'''
竞技场 - 购买挑战卷
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要购买的数量
    _num = int(data[0])
    # 参数不能为负数
    if _num <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('zypkjjc_buypknum_res_-1')
        return _res

    _con = g.GC['zypkjjccom']['base']
    _need = _con['buyneed']
    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _need]
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

    _sendData = g.delNeed(uid, _need, issend=False,logdata={'act': 'zypkjjc_buypknum'})
    g.sendChangeInfo(conn, _sendData)

    _prize = _con['pkneed']
    _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _prize]
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'zypkjjc_buypknum','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[5])
