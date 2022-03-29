#!/usr/bin/python
# coding:utf-8
'''
英雄--重生
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: ['5d2d9dc20ae9fe3a600679a9']
    :return:
    ::

        {'d': {'prize'分解奖励: [{'a': u'item', 'n': 8029, 't': u'2001'},
                               {'a': u'item', 'n': 8760, 't': u'2004'},
                               {'a': u'attr', 'n': 132700, 't': u'useexp'},
                               {'a': u'attr', 'n': 294500, 't': u'jinbi'}]},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄tid
    _tid = data[0]
    _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='lv')
    _prize = g.m.herofun.getHcPrizeByType('lv', _heroInfo)
    _prize = g.fmtPrizeList(_prize)
    # 英雄不存在 或者 等级小于1
    if not _heroInfo or _heroInfo['lv'] <= 1:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_heroerr')
        return _res
    
    _isLook = data[1]
    if not _isLook:
        _need = g.GC['herocom']['reborn']
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

        _sendData = g.delNeed(uid, _need, 0,{'act':'hero_reborn'})

        g.mdb.update('hero',{'uid':uid,'_id':g.mdb.toObjectId(_tid)},{'lv': 1})
        _hero_buff = g.m.herofun.reSetHeroBuff(uid, _tid, ['bdskillbuff'])
        _hero_buff[_tid]['lv'] = 1

        _send = g.getPrizeRes(uid, _prize, {'act': 'hero_reborn', 'lv': _heroInfo['lv']})
        g.mergeDict(_send, {'hero': _hero_buff})
        g.mergeDict(_send, _sendData)
        g.sendChangeInfo(conn, _send)
        # 检查是否有羁绊buff
        g.m.jibanfun.chkJiBanHero(uid, [_tid], conn, herodata=[_heroInfo])



    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = ['5dfc640ff42a7f1142bcc004',False]

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
