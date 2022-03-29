#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 撤退
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [哪个区:str, 第几座要塞:int]
    :return:
    ::

        {"d":{"prize": []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 哪个区
    _area = str(data[0])
    # 第几座要塞
    _number = int(data[1])
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 宝箱信息
    # _box = g.m.stormfun.getBoxData()
    _data = g.mdb.find1('storm',{'uid':uid,'over':{'$exists':0},'area':_area,'number':_number}, fields=['etime','stime','color','over','buytime','box'])
    # 要塞不存在  或者已经领取了
    if not _data or _data.get('over'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['storm']['base']
    # 新占领的要塞4小时内不可主动撤离
    if _data['stime'] + 4*3600 > g.C.NOW():
        _need = _con['333need']
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

        g.sendChangeInfo(conn, g.delNeed(uid, _need, issend=False, logdata={'act': 'storm_333'}))

    # _data['etime'] += _data.get('buytime', 0)
    # 挂机奖励 宝箱奖励
    _prize = []
    # 现在的时间
    _nt = g.C.NOW() if g.C.NOW() < _data['etime'] else _data['etime']

    _mul = (_nt - _data['stime']) // _con['fortress'][_data['color']]['sec'] + 1
    for p in _con['fortress'][_data['color']]['prize']:
        _prize.append({'a': p['a'], 't': p['t'], 'n': int(p['n'] * _mul) + 1})

    # 加上时段奖励
    for p in _con['timeprize'][_data['color']]:
        if _nt - _data['stime'] >= p['holdsec']:
            _prize += p['prize']

    _set = {'$set':{'over':1,'lasttime':g.C.NOW(),'etime':_nt},
            '$unset': {'box': 1}}
    # 如果有宝箱奖励
    if 'box' in _data:
        _prize += list(_con['box'][_data['box']]['prize'])

    g.setAttr(uid, {'ctype': 'storm_gjtime'}, {'$inc': {'v': _nt-_data['stime']}})
    g.mdb.update('storm',{'_id':_data['_id'],'uid':uid,'area':_area,'number':_number},_set)

    _prize = g.fmtPrizeList(_prize)
    _s = g.getPrizeRes(uid, g.fmtPrizeList(_prize), {'act':'storm_open','time':_nt-_data['stime']})
    g.sendChangeInfo(conn, _s)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('Z2')
    print doproc(g.debugConn, data=[21,0])