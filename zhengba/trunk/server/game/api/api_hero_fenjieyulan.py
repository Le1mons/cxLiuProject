#!/usr/bin/python
# coding:utf-8
'''
英雄--分解预览
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        {'d': {'prize'奖励信息: [{'a': u'item', 'n': 275, 't': u'2001'},
                         {'a': u'item', 'n': 300, 't': u'2004'},
                         {'a': u'attr', 'n': 4500, 't': u'useexp'},
                         {'a': u'attr', 'n': 10000, 't': u'jinbi'}]},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _tidList = data
    _heroTidList = [g.mdb.toObjectId(i) for i in _tidList]
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _heroTidList}})
    # 有一个英雄不存在就返回
    if len(_tidList) != len(_heroList):
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_hecheng_res_-1')
        return _res

    # 返回分解英雄的奖励信息
    _prize = g.m.herofun.getFenjiePrize(uid, _heroList, isyulan=True)
    _equipPrize =  _prize['equip']
    _shipinPrize = _prize['shipin']

    _res['d'] = {'prize': _prize['prize']+_equipPrize+_shipinPrize + _prize['wuhun']}
    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['5d2d9dc20ae9fe3a600679a8']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
