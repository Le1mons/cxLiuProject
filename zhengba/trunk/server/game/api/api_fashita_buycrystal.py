#!/usr/bin/python
# coding:utf-8
'''
法师塔 - 购买法术结晶
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 要购买的数量
    _buyNum = int(data[0])
    # 参数不能为负
    if _buyNum < 1:
        _res['s'] = -1
        _res['errmsg'] = g.L('fashita_buycrystal_res_-1')
        return _res

    _need = g.GC['fashitacom']['buyneed']
    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_buyNum} for i in _need]
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

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'fashita_buycrystal'})
    g.sendChangeInfo(conn, _sendData)

    g.m.fashitafun.setJieJingNum(uid, _buyNum)

    _res['d'] = {'num': _buyNum}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[5])