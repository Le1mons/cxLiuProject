#!/usr/bin/python
# coding:utf-8
'''
英雄--获取天命奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'prize'奖励信息: ({u'a': u'attr', u'n': 65000, u't': u'useexp'},)}, 's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    if not g.chkOpenCond(uid, 'tonyu'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.getAttrByDate(uid, {'ctype':'destiny_prize'})
    # 奖励已领取
    if _data:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _prize = g.m.herofun.getDestinyData(g.getGud(uid).get('destiny',0))['prize']
    # 没有可以领取的奖励
    if not _prize:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_gettmprize_-3')
        return _res

    g.setAttr(uid,{'ctype':'destiny_prize'},{'v':1})
    _sendData = g.getPrizeRes(uid, _prize,act={'act':'hero_gettmprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = [1]

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
