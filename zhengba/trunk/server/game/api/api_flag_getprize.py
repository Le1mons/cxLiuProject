#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 领取奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [领取的等级:int, 是否一键领取:bool]
    :return:
    ::

        {'d':{prize:[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _lv = int(data[0])
    # 是否一键领取
    _oneKey = int(data[1])
    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv','receive','prize','jinjie'])
    # 没有信息
    if not _flag:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 等级不足
    if not _oneKey and _flag['lv'] < _lv:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _prize, _set = [], {'$push':{},'$set':{'lasttime':g.C.NOW()}}
    # 领取特定等级
    if not _oneKey:
        # 基础奖励
        if _lv not in _flag.get('receive', {}).get('base', []):
            _set['$push']['receive.base'] = _lv
            _prize += _flag['prize'][str(_lv)]['base']

        # 进阶奖励
        if _flag['jinjie'] and _lv not in _flag.get('receive', {}).get('jinjie', []):
            _set['$push']['receive.jinjie'] = _lv
            _prize += _flag['prize'][str(_lv)]['jinjie']
    # 一键领取
    else:
        for lv in xrange(1, _flag['lv'] + 1):
            if lv not in _flag.get('receive', {}).get('base', []):
                _set['$push']['receive.base'] = {'$each': [lv] + _set['$push'].get('receive.base',{}).get('$each',[])}
                _prize += _flag['prize'][str(lv)]['base']
            # 进阶奖励
            if _flag['jinjie'] and lv not in _flag.get('receive', {}).get('jinjie', []):
                _set['$push']['receive.jinjie'] = {'$each': [lv] + _set['$push'].get('receive.jinjie',{}).get('$each',[])}
                _prize += _flag['prize'][str(lv)]['jinjie']
        _prize = g.fmtPrizeList(_prize)

    # 奖励已领取
    if not _prize:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_noprize')
        return _res

    g.mdb.update('flag', {'uid': uid}, _set)
    _send = g.getPrizeRes(uid, _prize, {'act': 'flag_getprize', 'lv':_lv,'yj':_oneKey})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = '0_5cd276679dc6d641b31c2859'
    print doproc(g.debugConn, data=[0,1])