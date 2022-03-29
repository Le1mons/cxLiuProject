#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要看的区域:str]
    :return:
    ::

        {"d":{'data':[{'number':第几座,'fightdata':阵容,'headdata':{},'color':品质,'etime':结束时间,'zhanli':玩家战力}]}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要查看哪个区
    _area = str(data[0])
    # 时间限制 2019.4.29之后开的区并且小于28天
    if g.getOpenTime() >= 1556467200 and g.getOpenDay() <= 28:
        _res['s'] = -2
        _res['errmsg'] = g.L('storm_open_-2', 29 - g.getOpenDay())
        return _res

    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _nt = g.C.NOW()
    _rData = {}
    # 没有领取奖励的要塞 我自己的没有领取的  或者非自己没有超时的
    _w = {'over': {'$exists': 0},'area':_area,'etime':{'$gte':_nt},'stime':{'$lte':_nt}}
    if _area == str(g.GC['storm']['base']['special']):
        _w['uid'] = uid
    _data = g.mdb.find('storm',_w, fields={'lasttime':0}, sort=[['number',1]]) or []
    # 如果是特殊区域
    if _area == str(g.GC['storm']['base']['special']):
        _data += g.m.stormfun.getRandFortress()
    for i in _data:
        if 'uid' in i:
            i['headdata'] = g.m.userfun.getShowHead(i.pop('uid'))
        if '_id' in i:
            del i['_id']
        if 'fightdata' in i:
            i['fightdata'] = filter(lambda x:'pid' not in x, i['fightdata'])
        _rData[i['number']] = i

    # 区域和要塞的具体信息
    _res['d'] = {'data': _rData}
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, data=[22])