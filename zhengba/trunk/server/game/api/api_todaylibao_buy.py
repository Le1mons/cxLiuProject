#!/usr/bin/python
# coding:utf-8
'''
每日基础礼包 - 购买
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [type, idx] 购买的礼包类型，买的idx
    :param key:
    :return:
                {'d':
                    {'prize': [{u'a': u'attr', u'n': 1, u't': u'jinbi'}]},
            's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _type = str(data[0])

    # 判断是否开启
    if not g.m.todaylibaofun.isOpen(uid):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    _con = g.GC['todaylibao']['data']
    # 判断是否可以购买
    _data = g.m.todaylibaofun.getToDayLiBao(uid)
    if _data[_type] >= len(_con[_type]['arr']):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('todaylibao_buy_res_-2')
        return _chkData

    _need = list(_con[_type]['arr'][_data[_type]]["baseneed"])
    _sale = _con[_type]['arr'][_data[_type]]["sale"]
    for i in _need:
        i['n'] = int(_sale * i['n'])

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

    _chkData["need"] = _need
    _chkData["data"] = _data
    _chkData["prize"] = _con[_type]['arr'][_data[_type]]['prize']
    _data[_type] += 1
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 设置数据
    g.setAttr(uid, {'ctype': 'taday_giftpackage'}, {'v': _chkData['data']})

    _send = g.delNeed(uid, _chkData["need"], logdata={'act': 'todaylibao_buy'})
    g.sendChangeInfo(conn, _send)

    # 获取奖励
    _send = g.getPrizeRes(uid, _chkData['prize'], {'act': 'todaylibao_buy','data': _chkData['data']})
    g.sendChangeInfo(conn, _send)

    _res["d"] = {'prize': _chkData['prize']}
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = ['0']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'