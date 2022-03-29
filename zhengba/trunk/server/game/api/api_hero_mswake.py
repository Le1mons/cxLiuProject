#!/usr/bin/python
# coding:utf-8
'''
英雄 - 融魂觉醒
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [是否觉醒10次:bool]
    :return:
    ::

        {gud里增加一个字段 mswake 代表觉醒等级
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 玩家等级不足
    if not g.chkOpenCond(uid, 'meltsoul'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _num = 10 if data[0] else 1

    _con = g.GC['meltsoulcom']['base']['wake']
    gud = g.getGud(uid)

    _heroNum = g.mdb.count('hero',{'uid':uid,'meltsoul':{'$gte':8}})
    # 还没激活
    if gud.get('mswake', 0) <= 0 and _heroNum < _con['hero']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _maxLv = _heroNum * _con['lv']
    # 已达到最大等级
    if gud.get('mswake', 0) + 1 >= _maxLv or str(gud.get('mswake', 0) + 1) not in _con['data']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_lverr')
        return _res

    _need = []

    for i in xrange(_num):
        _temp = g.fmtPrizeList(_need + list(_con['data'][str(gud.get('mswake', 0))]['need']))
        _chk = g.chkDelNeed(uid, _temp)

        # 材料不足
        if not _chk['res']:
            if i == 0:
                if _chk['a'] == 'attr':
                    _res['s'] = -100
                    _res['attr'] = _chk['t']
                else:
                    _res["s"] = -104
                    _res[_chk['a']] = _chk['t']
                return _res
            else:
                break

        _need = _temp
        gud['mswake'] = gud.get('mswake', 0) + 1

    g.sendChangeInfo(conn, g.delNeed(uid, _need, issend=False, logdata={'act': 'hero_mswake','arg':data}))

    # 设置公共buff
    g.mdb.update('buff',{'uid':uid},{'buff.meltsoul':[_con['data'][str(gud['mswake'])]['buff']]},upsert=True)
    _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})

    g.m.userfun.updateUserInfo(uid, {'mswake': gud['mswake']})
    _send = {'attr': {'mswake': gud['mswake']}}
    if _r:
        _send['hero'] = _r
    g.sendChangeInfo(conn, _send)

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5f64d9999dc6d62152d285bd'])