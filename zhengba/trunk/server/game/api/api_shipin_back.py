# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———  回退
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [饰品id:str, 英雄tid:str(回退背包里面的饰品就传"")]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}
    # 回退的饰品
    _sid = data[0]
    # 英雄tid
    _tid = data[1]

    if _sid.find('_') == -1:
        _con = g.GC['shipin'][_sid]
    else:
        _con = g.GC['shipin'][_sid.split('_')[0]]
    # 该装备不能升阶
    if not _con['back']['prize']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 消耗不充足
    _need = list(_con['back']['need'])

    # 升阶英雄穿戴的装备
    if len(_tid) != 0:
        _hero = g.m.herofun.getHeroInfo(uid, _tid, keys='weardata,_id')
        # 英雄不存在
        if not _hero:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        if '5' not in _hero['weardata'] or _hero['weardata']['5'] != _sid:
            # 装备不存在
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _res['hero'] = _hero
    else:
        _need.append({'a': 'shipin', 't': _sid, 'n': 1})

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

    _res['need'] = _need
    _res['prize'] = _con['back']['prize']
    return _res



@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'shipin_back','id':data[0]})
    g.sendChangeInfo(conn, _send)

    _prize = _chkData['prize']

    # 如果是觉醒后的饰品
    if data[0].find('_') != -1:
        _prize = []
        _spCon = g.GC['shipin']
        _con = g.GC['shipincom']['awake']
        for i in _chkData['prize']:
            if i['a'] == 'shipin' and i['t'][:3] == data[0][:3]:
                _prize.append({'a':'shipin','t':i['t'],'n':i['n']-1})
                _con = g.GC['shipincom']['awake']
                _prize.append({'a':i['a'],'t':'{0}_{1}'.format(i['t'],data[0].split('_')[1]),'n':1})
            else:
                _prize.append(i)

    _send = g.getPrizeRes(uid, _prize, {'act': 'shipin_back','id':data[0]})
    # 升阶英雄穿戴的装备
    if 'hero' in _chkData:
        g.m.herofun.updateHero(uid, data[1], {'$unset': {'weardata.5': 1}})
        _heroData = g.m.herofun.reSetHeroBuff(uid, data[1], ['shipin'])

        del _chkData['hero']['weardata']['5']
        _heroData[data[1]]['weardata'] = _chkData['hero']['weardata']
        _send['hero'].update(_heroData)

    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ["627603_10000164", '']
    _r = doproc(g.debugConn, data)
    print _r