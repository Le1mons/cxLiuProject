#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
杂货店——刷新
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _zhpInfo = g.m.zahuopufun.getZaHuoPuData(uid)
    # _nt = g.C.NOW()
    # _freetime = _zhpInfo.get('freetime')
    # 存在freetime 但是 当前时间小于freetime
    # if _freetime and _nt  < _freetime:
    _freeInfo = g.m.zahuopufun.getRfNum(uid, getcd=1)
    _freeNum = _freeInfo['num']
    if _freeNum <= 0:
        _need = [{'a':'attr','t':'rmbmoney','n':15}]
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
        g.delNeed(uid, _need,logdata={'act':'zahuopu_shuaxin'})
        g.sendChangeInfo(conn, _need)
    else:
        _freeInfo = g.m.zahuopufun.setJieJingNum(uid, -1)
        _freeInfo['freetime'] += 2 * 3600

    _data = g.m.zahuopufun.getZaHuoPuData(uid, isref=1)
    _shopItem = _data['shopitem']
    _freeInfo.update({'itemlist':_shopItem})
    _res['d'] = _freeInfo
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])