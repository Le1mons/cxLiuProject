#!/usr/bin/python
# coding:utf-8
'''
周月礼包 - 领奖
'''

import sys

sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str('week','month'), proid:str]
    :return:
    ::

        {'d':{
            'itemdict': {’充值id‘: {'num': 次数}},
            'et': 结束时间
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    uid = conn.uid
    _res = {"s": 1}
    key = str(data[0])
    proid = data[1]
    _con = g.m.weekmonthlibaofun.getCon(key, g.m.weekmonthlibaofun.getWeekNum(key))
    # 配置不存在
    if not _con:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 不能免费领取
    if _con['itemdict'][proid]['rmbmoney'] != 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    res = g.m.weekmonthlibaofun.getWMLiBao(uid,key)
    # 已经领取了
    if res['itemdict'].get(proid, {}).get('num', 1) <= 0:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    prize = _con['itemdict'][proid]['p']
    changeInfo = g.getPrizeRes(uid, prize, {'act': 'weekmonthlibao_receive','key':key})
    g.sendChangeInfo(conn, changeInfo)

    g.setAttr(uid, {'ctype': 'libao_' + key}, {'$set': {'v.itemdict.{}.num'.format(proid): 0}})
    _res["d"]  = res
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print proc(g.debugConn, ['month', 'month_0'])
