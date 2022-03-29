# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
武魂———回收
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [武魂tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _wid = data[0]

    _wuhun = g.mdb.find1('wuhun', {'uid': uid, '_id': g.mdb.toObjectId(_wid)}, fields=['lv','id','wearer'])
    # 武魂不存在 或者已穿戴
    if _wuhun is None or 'wearer' in _wuhun:
        _res["s"] = -1
        _res["errmsg"] = g.L('wuhun_recycle_res_1')
        return _res

    _con = g.GC['wuhuncom']['base']
    # 大于1级有消耗
    if _wuhun['lv'] > 1:
        _need = _con['recycle']['need']
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

    _res['wuhun'] = _wuhun
    _res['con'] = _con
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    if 'need' in _chkData:
        _send = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'wuhun_recycle'})
        g.sendChangeInfo(conn, _send)

    _prize = list(_chkData['con']['recycle']['prize'])
    # 计算消耗
    for i in xrange(1, _chkData['wuhun']['lv']):
        _prize.append({
            "a":    'item',
            "t":    _chkData['con']['item'],
            "n":    _chkData['con']['need'][str(i)]['num']
        })
        _prize += _chkData['con']['need'][str(i)]['need']

    g.mdb.delete('wuhun', {'uid':uid,'_id':_chkData['wuhun']['_id']})

    g.mc.delete('wuhun_{0}'.format(data[0]))

    _prize = g.fmtPrizeList(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act': 'wuhun_recycle','lv':_chkData['wuhun']['lv']})

    g.mergeDict(_send, {'wuhun': {data[0]: {'num': 0}}})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    _prize = []
    _con = g.GC['wuhuncom']['base']
    for i in xrange(1, 20):
        _prize.append({
            "a": 'item',
            "t": _con['item'],
            "n": _con['need'][str(i)]['num']
        })
        _prize += _con['need'][str(i)]['need']
    _prize = g.fmtPrizeList(_prize)
    # _r = doproc(g.debugConn, data)
    print _prize
