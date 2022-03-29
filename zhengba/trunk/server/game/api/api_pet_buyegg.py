#!/usr/bin/python
# coding:utf-8
'''
宠物 - 购买蓝蛋
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [数量: num]
    :return:
    ::

        {"d": {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _num = abs(int(data[0]))
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    _buynum = g.getPlayAttrDataNum(uid, 'pet_dailybuynum')
    # 次数不足
    if _buynum + _num > _con['daily_goods']['num']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _need = []
    for i in xrange(_buynum, _buynum + _num):
        _need += _con['daily_goods']['need'][i]

    _need = g.fmtPrizeList(_need)
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chk['t']
        else:
            _chkData["s"] = -104
            _chkData[_chk['a']] = _chk['t']
        return _chkData

    _chkData['need'] = _need
    _chkData['num'] = _num
    _chkData['con'] = _con
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.setPlayAttrDataNum(uid, 'pet_dailybuynum', _chkData['num'])
    _delData = g.delNeed(uid, _chkData['need'], 0, {'act':'pet_buyegg', 'num': _chkData['num']})

    _prize = [{'a':i['a'], 't':i['t'], 'n':i['n'] * _chkData['num']} for i in _chkData['con']['daily_goods']['prize']]
    _send = g.getPrizeRes(uid, _prize, {'act': 'pet_buyegg', 'num': _chkData['num']})
    g.mergeDict(_delData, _send)
    g.sendChangeInfo(conn, _delData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2])