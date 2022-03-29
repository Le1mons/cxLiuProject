# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———觉醒
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str(hero,shipin), 英雄tid或者饰品id:str]
    :return:
    ::

        {'d': {'如果是需要询问的情况下 饰品id': {"id":技能id, "hero":英雄tid}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}

    _con = g.GC['shipincom']['awake']

    # 消耗不充足
    _need = _con['need']
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

    # 觉醒英雄穿戴的装备
    if data[0] == 'hero':
        _hero = g.m.herofun.getHeroInfo(uid, data[1], keys='weardata,_id')
        # 英雄不存在
        if not _hero or '5' not in _hero['weardata']:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        _sid = _hero['weardata']['5']
        _res['hero'] = _hero
    else:
        _sid = str(data[1])

    _spCon = g.m.shipinfun.getShipinCon(_sid)
    # 该饰品不能觉醒
    if _spCon['color'] < _con['color'] or _spCon['star'] < _con['star']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _res['need'] = _need
    _res['sid'] = _sid
    return _res



@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.sendChangeInfo(conn, g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'shipin_awake','args':data,'id':_chkData['hero']['weardata']['5'] if data[0]=='hero' else data[1]}))

    _con = g.GC['shipincom']['awake']

    # 随机一条技能
    _skill = g.C.RANDARR(_con['skill'], sum(i['p'] for i in _con['skill']))['id']
    if _chkData['sid'].find('_') != -1:
        while _skill == _chkData['sid'].split('_')[1]:
            _skill = g.C.RANDARR(_con['skill'], sum(i['p'] for i in _con['skill']))['id']

    _set = {'id':_skill}

    # 升阶英雄穿戴的装备
    if _chkData['sid'].find('_') == -1:
        if 'hero' in _chkData:
            g.m.herofun.updateHero(uid, data[1], {'weardata.5': '{0}_{1}'.format(_chkData['sid'], _skill)})

            _chkData['hero']['weardata']['5'] = '{0}_{1}'.format(_chkData['sid'], _skill)
            g.sendChangeInfo(conn,{'hero': {data[1]: {'weardata': _chkData['hero']['weardata']}}})

            _res['d'] = {'spid': '{0}_{1}'.format(_chkData['sid'], _skill)}
        else:
            # 不是需要询问的  需要减少数量 增加新饰品
            _send = g.m.shipinfun.changeShipinNum(uid, _chkData['sid'], -1)
            g.sendChangeInfo(conn, {'shipin': _send})
            _prize = [{'a':'shipin','t':'{0}_{1}'.format(_chkData['sid'], _skill), 'n': 1}]

            _send =g.getPrizeRes(uid, _prize, {'act': 'shipin_awake','args':data})
            g.sendChangeInfo(conn, _send)

            _res['d'] = {'tid': _send['shipin'].keys()[0]}

    # 如果之前有技能   需要询问一次
    else:
        if 'hero' in _chkData:
            _set['hero'] = data[1]
        g.setAttr(uid, {'ctype': 'shipin_awake'},{'v.{}'.format(_chkData['sid']): _set})

        _res['d'] = {'awake': {_chkData['sid']: _set}}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['shipin', '613602']
    _r = doproc(g.debugConn, data)
    print _r