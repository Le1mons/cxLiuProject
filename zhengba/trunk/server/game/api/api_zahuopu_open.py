#!/usr/bin/python
# coding:utf-8
'''
杂货店——开启
'''

import sys

sys.path.append('..')
sys.path.append('game')
import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'itemlist': [{'rnum':最大刷新次数,'need':购买消耗,'buynum':后买次数,'sale':折扣,'item':奖励}], 'freetime':免费时间, 'num':剩余次数},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _data = g.m.zahuopufun.getZaHuoPuData(uid)
    _freetime = _data.get('freetime', 0) #g.C.NOW()
    _shopItem = _data['shopitem']
    _temp = g.getAttrOne(uid,{'ctype':'zahuopu_rfnum'})
    _nt = g.C.NOW()
    _freeInfos = g.m.zahuopufun.getRfNum(uid, getcd=1)
    _freeInfos['freetime'] += 2*3600
    _freeInfos.update({'itemlist':_shopItem})
    _res['d'] = _freeInfos

    # 圣诞活动
    g.event.emit('shengdan', uid, {'liwu': ['1']})

    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])

