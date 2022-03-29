#!/usr/bin/python
# coding:utf-8
'''
中秋节 - 中秋商市
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [购买的索引:int]
    :return:
    ::

        {"d": {
            prize: []
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_hdnoopen')
        return _res

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_hdnoopen')
        return _res

    _idx = abs(int(data[0]))
    _num = abs(int(data[1]))
    _con = g.m.midautumnfun.getCon(_hd['data']['con'])['store'][_idx]
    _data = g.m.midautumnfun.getData(uid, _hd['hdid'], _hd['data'].get('con','midautumn'))
    # 购买次数不够
    if _data['store'][_idx] + _num > _con['num']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_numerr')
        return _res

    _need = [{'a':i['a'],'t':i['t'],'n':i['n'] * _con['sale'] / 100 * _num} for i in _con['need']]
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

    _res['need'] = _need
    _res['num'] = _num
    _res['hdid'] = _hd['hdid']
    _res['prize'] = [{'a':i['a'],'t':i['t'],'n':i['n'] * _num} for i in _con['prize']]
    return _res

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = g.delNeed(uid, _chkData['need'], 0, {'act': 'midautumn_store'})

    g.m.midautumnfun.setData(uid, _chkData['hdid'], {'$inc': {'store.{}'.format(data[0]): _chkData['num']}})

    _prize = _chkData['prize']
    _s = g.getPrizeRes(uid, _prize, {'act': 'midautumn_store','args':data})
    g.mergeDict(_send, _s)
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0, 1])