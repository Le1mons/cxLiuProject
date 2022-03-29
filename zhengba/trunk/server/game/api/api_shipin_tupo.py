# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———  突破
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str, 材料信息:dict{饰品id: 饰品数量}]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄tid
    tid = data[0]
    # 饰品信息
    _spDict = data[1]

    _hero = g.m.herofun.getHeroInfo(uid, tid, keys='_id,weardata')
    # 英雄不存在 或者没有饰品
    if not _hero or '5' not in _hero.get('weardata', {}):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _con = g.m.shipinfun.getShipinCon(_hero['weardata']['5'])
    # 参数错误
    if not _con['tpid'] or sum(_spDict.values()) != _con['tpneed']['num'] or set([i if i.find('_') == -1 else i.split('_')[0] for i in _spDict]) - set(_con['tpneed']['shipin']):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _upid = g.m.shipinfun.getShipinCon(_hero['weardata']['5'])['tpid']

    # 已达到最大星级
    if not _upid:
        _res['s'] = -3
        _res['mrrmsg'] = g.L('shipin_upstar_res_-3')
        return _res

    if _hero['weardata']['5'].find('_') != -1:
        _upid = '{}_{}'.format(_upid, _hero['weardata']['5'].split('_')[1])

    _need,_allExp = [], 0
    for spid,num in _spDict.items():
        _allExp += (int(g.m.shipinfun.getShipinCon(spid)['tgexp']) - int(g.m.shipinfun.getShipinCon(spid)['upexp'])) * num
        _need.append({'a':'shipin','t':spid,'n':num})

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104 if _chk['a']=='item' else -108
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need, logdata={'act': 'shipin_tupo', 'info':_spDict})
    g.sendChangeInfo(conn, _sendData)

    # 设置穿戴信息
    _shipinInfo = g.m.herofun.setUserWearInfo(uid, tid, '5', _upid)
    # 更新数据库对应信息
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid,['shipin'])
    _heroBuff[tid].update(_shipinInfo)
    g.sendChangeInfo(conn, {'hero':_heroBuff})
    g.event.emit('JJCzhanli', uid, tid)

    _res['d'] = {'prize':[]}

    # 多的经验换成 星界精华 返回给玩家
    _essence_num = int(_allExp * 0.1)
    # 星界精华的id
    _spid = '1001'
    if _essence_num > 0:
        _sendData = g.m.shipinfun.changeShipinNum(uid, _spid, _essence_num)
        g.sendChangeInfo(conn, {"shipin":_sendData})

        _res['d']['prize'] += [{'a':'shipin','t':_spid,'n':_essence_num}]
        g.m.dball.writeLog(uid, "shipin_tupo_prize", {"prize":_res['d']['prize']})
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ["5fe312b5ae6c8c110d951796",{"6101_10000144":3}]
    _r = doproc(g.debugConn, data)
    print _r