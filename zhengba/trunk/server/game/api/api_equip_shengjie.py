#!/usr/bin/python
# coding:utf-8
'''
装备 - 装备升阶
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [装备id:str, 英雄tid:str(升级背包里面的装备就传"")]
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
    # 转换的装备
    _eid = str(data[0])
    # 英雄tid
    _tid = data[1]

    _con = g.GC['equip']
    # 该装备不能升阶
    if not _con[_eid]['shengjie']['dlz']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 消耗不充足
    _need = list(_con[_eid]['shengjie']['need'])
    for i in _need:
        if i['t'] == _eid:
            i['n'] += 1


    # 升阶英雄穿戴的装备
    if len(_tid) != 0:
        _hero = g.m.herofun.getHeroInfo(uid, _tid, keys='weardata,_id')
        # 英雄不存在
        if not _hero:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        for pos in _hero['weardata']:
            if _hero['weardata'][pos] == _eid:
                _res['pos'] = pos
                _res['hero'] = _hero
                break
        else:
            # 装备不存在
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 先把usenum - 1
        g.mdb.update('equiplist', {'uid': uid, 'eid': _eid}, {'$inc': {'usenum': -1}})

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        # 在英雄身上的裝備不足的話  就加回來
        if len(_tid) != 0:
            g.mdb.update('equiplist', {'uid': uid, 'eid': _eid}, {'$inc': {'usenum': 1}})
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _res['need'] = _need
    _res['dlz'] = _con[_eid]['shengjie']['dlz']
    return _res



@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'equip_shengjie','id':data[0]})
    g.sendChangeInfo(conn, _send)

    _send = {}
    _prize = g.m.diaoluofun.getGroupPrize(_chkData['dlz'])
    # 升阶英雄穿戴的装备
    if 'pos' in _chkData:
        g.m.herofun.updateHero(uid, data[1], {'weardata.{}'.format(_chkData['pos']): _prize[0]['t']})
        _heroData = g.m.herofun.reSetHeroBuff(uid, data[1], ['equip'])

        _chkData['hero']['weardata'][_chkData['pos']] = _prize[0]['t']
        _heroData[data[1]]['weardata'] = _chkData['hero']['weardata']
        _send['hero'] = _heroData

        # 如果装备存在 usenum 就加1
        _equip = g.mdb.count('equiplist',{'uid': uid, 'eid': _prize[0]['t']})
        if _equip == 1:
            g.mdb.update('equiplist', {'uid': uid, 'eid': _prize[0]['t']}, {'$inc': {'usenum': 1,'num':1}})
        else:
            _equipCon = g.GC['equip'][_prize[0]['t']]
            _equipInfo = {
                'color': _equipCon['color'],
                'star': _equipCon['star'],
                'type': _equipCon['type'],
                'usenum': 1,
                'num': 1,
                'uid': uid,
                'eid': _prize[0]['t']
            }
            g.mdb.insert('equiplist', _equipInfo)
    else:
        _send = g.getPrizeRes(uid, _prize, {'act': 'equip_shengjie', 'id': data[0]})

    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['2056','5e1d2f507e112150c589b0a8']
    _r = doproc(g.debugConn, data)
    print _r