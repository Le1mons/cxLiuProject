#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 匹配及挑战
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn:
    :param data: [阵容[{}]:list (1v1就传一个 3v3传3个)]
    :return:
    ::

        {'d': {
            'fightres': [{}]，
            'winnum': 我方获胜次数，
            'headdata': [{},{}]，
            'prize': []
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['ladder']
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or g.getGud(uid)['lv'] < _con['lv']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    # 不在挑战期内
    if not _con['time'][0] <= g.C.NOW() - g.C.getWeekFirstDay(g.C.NOW()) <= _con['time'][1]:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _team = data[0]
    _mystar = g.m.ladderfun.getUserStar(uid)
    _star = min(_mystar, g.GC['ladder']['maxstar'])
    _con = g.GC['ladder']['star'][str(_star)]
    # 队伍数量不对
    if len(_team) != _con['mode']:
        _res["s"] = -3
        _res["errmsg"] = g.L('global_noopen')
        return _res

    # 有重复的英雄
    if _con['mode'] == 3 and not g.m.championfun.checkRepeatHero(_team):
        _res['s'] = -4
        _res['errmsg'] = g.L('championtrial_defend_res_-1')
        return _res

    _today = g.getAttrByDate(uid, {'ctype': 'ladder_today'}) or [{'v': {}}]
    # 挑战次数不足
    if g.m.ladderfun.getEnergeNum(uid) <= 0:
        _res['s'] = -5
        _res['errmsg'] = g.L('global_numerr')
        return _res

    _fightData = []
    for i in _team:
        _chkFightData = g.m.fightfun.chkFightData(uid, i)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res

        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=i.get('sqid'))
        _fightData.append(_userFightData)

    _res['data'] = _fightData
    _res['con'] = _con
    _res['today'] = _today
    _res['star'] = _star
    _res['mystar'] = _mystar
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _today = _chkData['today']

    _rival = g.m.ladderfun.getRival(uid, _chkData['star'], _today[0]['v'].get('lose', 0))
    _con = _chkData['con']
    _fightResList = []
    _winNum, _loseNum = 0, 0

    _hero = g.C.dcopy(_chkData['data'])
    for i in _hero:
        for x in i:
            x['side'] = 1

    _mode = _con['mode']
    _set = {'$set': {{1: "1v1", 3: "3v3"}[_con['mode']]: _hero}}
    for i in xrange(_con['mode']):
        f = ZBFight('pvp')
        _fightRes = f.initFightByData(_chkData['data'][i] + _rival['hero'][i]).start()
        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _chkData['data'][i])
        # _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _rival['head']]
        _fightResList.append(_fightRes)
        if _fightRes['winside'] == 0:
            _winNum += 1
        else:
            _loseNum += 1

        if _winNum >= 2 or _loseNum >= 2:
            break

    _con = g.GC['ladder']

    _rData = {"headdata":[g.m.userfun.getShowHead(uid), _rival['head']],"fightres":_fightResList,'winnum':_winNum}

    _today[0]['v']['fight'] = _today[0]['v'].get('fight', 0) + 1
    if _winNum > _loseNum:
        _today[0]['v']['win'] = _today[0]['v'].get('win', 0) + 1
        _today[0]['v']['lose'] = 0
        if _con['prize']['fight'][1] > 0:
            _set['$inc'] = {'star': _con['prize']['fight'][1]}
            _chkData['mystar'] += _con['prize']['fight'][1]
    else:
        if _today[0]['v'].get('win', 0) < 3:
            _today[0]['v']['win'] = 0
        _today[0]['v']['lose'] = _today[0]['v'].get('lose', 0) + 1
        if _con['star'][str(_chkData['star'])]['lose'] > 0:
            # 加心
            _set['$inc'] = {'star': -_con['star'][str(_chkData['star'])]['lose']}
            _chkData['mystar'] -= _con['star'][str(_chkData['star'])]['lose']

    g.crossDB.update('ladder', {"uid": uid, 'key': g.C.getWeekNumByTime(g.C.NOW())}, _set)

    g.setAttr(uid, {'ctype': 'ladder_today'}, {'v': _today[0]['v']})

    g.m.ladderfun.setEnergeNum(uid, -1)

    _prize = _con['prize']['fight'][0]
    _send = g.getPrizeRes(uid, _prize, {'act':'ladder_fight','star':_chkData['mystar']})
    g.sendChangeInfo(conn, _send)

    g.mdb.insert('ladder_log', {'uid': uid, 'data':_fightResList, 'headdata':_rival['head'], 'ctime':g.C.NOW(), 'num':_winNum,'zhanli':_rival['zhanli'],'mode':_mode,'ttltime':g.C.TTL()})
    _rData['prize'] = _prize
    _res['d'] = _rData
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[[{1: "5e876da89dc6d6742a4eae2e", 2: "5e9025bb9dc6d67cf8308c04"}]])
