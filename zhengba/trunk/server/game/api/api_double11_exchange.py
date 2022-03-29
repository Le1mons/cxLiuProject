#!/usr/bin/python
# coding:utf-8
'''
双11 - 兑换
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int, 数量:int]
    :return:
    ::

        {"d": {'prize':[],'data':open数据exchange的}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开  过了抽奖的时间
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _idx = abs(int(data[0]))
    _num = abs(int(data[1]))
    _con = g.m.double11fun.getCon()['exchange'][_idx]
    _myData = g.m.double11fun.getData(uid, _hd['hdid'])
    # 超过数量
    if _myData['exchange'].get(str(_idx), 0) + _num > _con['num']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _myData['exchange'][str(_idx)] = _myData['exchange'].get(str(_idx), 0) + _num

    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _con['need']]
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

    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _con
    _chkData['need'] = _need
    _chkData['data'] = _myData['exchange']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 扣除消耗
    g.sendChangeInfo(conn, g.delNeed(uid,_chkData['need'],0,{'act': 'double11_lottery'}))

    g.m.double11fun.setData(uid, {'exchange': _chkData['data']}, _chkData['hdid'])
    _prize = [{'a':i['a'],'t':i['t'],'n':i['n'] * data[1]} for i in _chkData['con']['prize']]

    _send = g.getPrizeRes(uid, _prize, {'act':'double11_exchange','args':data})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': _chkData['data']}
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0,1])