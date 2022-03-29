#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 我的信息
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

        {"d":{
            "box 天降宝箱": {'v':{宝箱品质: {区域: 要塞的索引}}}
            'show':[{'area': 区域, 'color':要塞品质, 'time':剩余时间}],
            'buynum': 已购买次数,
            'target': 共挂机多久,
            'maxbuynum': 最后购买次数,
            'num': 精力,
            'fightdata':我的阵容,
            'data 我占领的要塞数据': [{'number':第一座,'etime':结束时间,'color':品质,'fightdata':该要塞的阵容,'stime':开始时间,'area':区域,'box':宝箱品质}]
            'gjprize': [挂机奖励],
            'boxprize': 宝箱奖励
            }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 时间限制 2019.4.29之后开的区并且小于28天
    if g.getOpenTime() >= 1556467200 and g.getOpenDay() < 28:
        _res['s'] = -2
        _res['errmsg'] = g.L('storm_open_-2')
        return _res
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _nt = g.C.NOW()
    _rData = {'fightdata': [], 'data': []}
    # 宝箱信息
    _box = g.m.stormfun.getBoxData()
    # 挂机奖励 宝箱奖励
    _gjPrize,_prize,_showData = [], [], []
    _time, _gjW = 0, {'uid': uid, '_id': {'$in': []}}
    _con = g.GC['storm']['base']

    # 我的占领信息
    _myData = g.mdb.find('storm',{'uid':uid,'over':{'$exists':0}},fields=['number','etime','color','fightdata','stime','area','box'])
    for i in _myData:
        # 如果有宝箱奖励  并且已经过时
        if 'box' in i:
            _prize += list(_con['box'][i['box']]['prize'])
            _rData['boxprize'] = _prize

        # 挂机奖励到时间了 或者被人打下来了
        if _nt >= i['etime']:
            _mul = (i['etime'] - i['stime']) // _con['fortress'][i['color']]['sec'] + 1
            for p in _con['fortress'][i['color']]['prize']:
                _gjPrize.append({'a':p['a'],'t':p['t'],'n':int(p['n'] * _mul)+1})

            # 加上时段奖励u'zzb131'
            for p in _con['timeprize'][i['color']]:
                if i['etime'] - i['stime'] >= p['holdsec']:
                    _gjPrize += p['prize']
            _rData['gjprize'] = _gjPrize = g.fmtPrizeList(_gjPrize)

            _showData.append({'area':i['area'], 'color':i['color'], 'time':i['etime']-i['stime']})
            _time += i['etime'] - i['stime']
            _gjW['_id']['$in'].append(i['_id'])
            continue

        _rData['fightdata'] += i.pop('fightdata').values()
        del i['_id']
        _rData['data'].append(i)

    # 消除宝箱奖励
    g.mdb.update('storm',{'uid':uid},{'$unset': {'box': 1}})

    # 有宝箱奖励
    if _prize:
        _rData['boxprize'] = _prize

    # 有挂机奖励
    if _gjPrize or _prize:
        _s = g.getPrizeRes(uid, g.fmtPrizeList(_prize + _gjPrize), {'act':'storm_open','prize':_prize,'gjprize':_gjPrize})
        g.sendChangeInfo(conn, _s)
        if _gjPrize:
            g.setAttr(uid, {'ctype': 'storm_gjtime'}, {'$inc': {'v': _time}})
            g.mdb.update('storm', _gjW, {'over': 1})

    # 天降宝箱的信息
    _rData['box'] = _box
    _rData['show'] = _showData
    _rData['buynum'] = g.getPlayAttrDataNum(uid, 'storm_buynum')
    _rData['target'] = g.getAttrOne(uid, {'ctype':'storm_gjtime'}, keys='_id,reclist,v') or {'v':0}
    _rData['maxbuynum'] = g.m.stormfun.getMaxBuyNum(uid)
    _rData['num'] = g.m.stormfun.getEnergeNum(uid)
    if _rData['num'] > 25:
        _rData['num'] = 25
    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, data=[])