#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
每日试练——购买次数
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _type = data[0]
    # 不是三种类型其中一种
    if _type not in g.GC['meirishilian']:
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsl_buynum_res_-1')
        return _res

    _maxNum = g.m.mrslfun.getMaxBuyNum(uid)
    _buyNum = g.m.mrslfun.getBuyNum(uid, _type)
    # 今日剩余购买次数不足
    if _buyNum >= _maxNum:
        _res['s'] = -2
        _res['errmsg'] = g.L('mrsl_buynum_res_-2')
        return _res

    _need = g.m.mrslfun.getBuyNeed(uid, _type)
    _chk = g.chkDelNeed(uid, _need)
    # 消耗不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need,logdata={'act': 'mrsl_buynum'})
    g.sendChangeInfo(conn, _sendData)
    g.m.mrslfun.setBuyNum(uid, _type)
    _res['d'] = {'buynum': _maxNum-_buyNum-1}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao1')
    print doproc(g.debugConn, ['jinbi'])