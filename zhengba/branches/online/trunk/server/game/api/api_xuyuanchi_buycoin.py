#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
许愿池--购买许愿币
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _num = int(data[0])
    # 不能为负数
    if _num <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('xuyuanchi_buycoin_res_-1')
        return _res

    _con = g.GC['xuyuanchi']['common']
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

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'xuyuanchi_buycoin'})
    g.sendChangeInfo(conn, _sendData)

    _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _con['buyprize']]
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'xuyuanchi_buycoin','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("8")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[5])