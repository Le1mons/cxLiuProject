#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
from ZBFight import ZBFight

'''
公会争锋 - 战斗
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 战斗数据
    _fightData = data[0]
    # 对手信息 {ghid:'',uid:''}
    _rivalData = data[1]
    gud = g.getGud(uid)
    # 必须大于30级才能参加
    if not g.chkOpenCond(uid, 'ghcompeting'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _nt = g.C.NOW()
    _con = g.GC['guildcompeting']['base']
    # 非挑战期
    if not g.C.ZERO(_nt)+_con['time']['fight'][0]<=_nt<=g.C.ZERO(_nt)+_con['time']['fight'][1]:
        _res['s'] = -2
        _res['errmsg'] = g.L('ghcompeting_fight_-2')
        return _res

    # 参数不对
    if not g.crossDB.find1('competing_main',{'ghid':gud['ghid'],'rival_ghid':_rivalData['ghid']},fields={'_id':1}):
        _res['s'] = -8
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 锁
    _lock = g.mc.get(str('ghcompeting' + _rivalData['uid']))
    if _lock:
        _res['s'] = -7
        _res['errmsg'] = g.L('ghcompeting_fight_-7')
        return _res
    g.mc.set(str('ghcompeting' + _rivalData['uid']), 1, 2)

    _atkNum = g.m.competingfun.getCanFightNum(uid)
    # 没有进攻次数
    if _atkNum <= 0:
        _res['s'] = -4
        _res['errmsg'] = g.L('ghcompeting_fight_-4')
        return _res

    # 当前玩家脸都被打肿了,换个挑战吧!
    if g.m.competingfun.getLifeNum(_rivalData['uid']) <= 0:
        _res['s'] = -5
        _res['errmsg'] = g.L('ghcompeting_fight_-5')
        return _res

    _season = g.m.competingfun.getSeasonNum()
    _rivalData.update({'season':_season})
    _data = g.crossDB.find1('competing_userdata',{'uid':_rivalData['uid'],'season':_season},fields=['_id'])
    if not _data:
        _res['s'] = -6
        _res['errmsg'] = g.L('ghcompeting_fight_-6')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    f = ZBFight('pvp')
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))

    f.initFightByData(_userFightData + _data['fightdata'])
    # 对手有状态就继承
    if 'fightless' in _data:
        f.setRoleHp(1, _data['fightless'])

    _fightRes = f.start()
    _fightRes['headdata'] = [_chkFightData['headdata'], _data['headdata']]
    _winside = _fightRes['winside']
    _resData = {'fightres': _fightRes}
    _ghData = g.crossDB.find1('competing_main',{'season':_season,'ghid':gud['ghid']},fields=['_id'])
    if _winside == 0:
        # 公会增加被杀积分
        _ghData['jifen'] += _data['lose_jifen']
        _resData['fightres']['jifen'] = _data['lose_jifen']
        g.crossDB.update('competing_main',{'season':_season,'ghid':gud['ghid']},{'jifen':_ghData['jifen']})
        # 减少生命
        g.m.competingfun.setUsedLifeNum(_data['uid'])

        # 如果残血就删除状态信息
        if 'fightless' in _data:
            g.crossDB.update('competing_userdata', {'uid':_rivalData['uid']}, {'$unset': {'fightless':1}})
    else:
        # 记录对手的残余状态
        _fightLess = {}
        for k, v in _fightRes['fightres'].items():
            for i in _data['fightdata']:
                # 对方角色
                if v['side'] == 1 and 'pos' in v and 'pos' in i and v['pos'] == i['pos']:
                    _fightLess[str(i['pos'])] = v['hp']

        g.crossDB.update('competing_userdata', {'uid':_rivalData['uid']},{'fightless': _fightLess})

    # 增加对战信息
    _setData = {'ghid':gud['ghid'],'rival_ghid':_rivalData['ghid'],'name':gud['name'],'winside':_winside,'ttltime':g.C.TTL(),
                'rival_name':_data['headdata']['name'],'ctime':g.C.NOW(),'dps':_fightRes['dpsbyside'][0],'jifen':_data['lose_jifen']}
    g.crossDB.insert('competing_fightdata',_setData)

    # 获取翻牌奖励
    _dlzId = g.GC['guildcompeting']['base']['segment'][str(_ghData['segment'])]['flop_dlz']
    _resPrize = {'prize': [], 'show': []}
    for i in xrange(3):
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        if i == 0:
            _resPrize['prize'] += _prize
            _sendData = g.getPrizeRes(uid, _prize, act={'act': 'shizijun_fight', 'prize': _prize})
            g.sendChangeInfo(conn, _sendData)
        else:
            _resPrize['show'] += _prize
    _resData.update({'flop': _resPrize})

    g.m.competingfun.setUsedFightNum(uid)
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=[{"2":"5be8f4efc0911a40c0ba80e9","sqid":2},{"ghid":"5c041fe4c0911a3dd87d454e","uid":"0_5bc01c47c0911a2c50550e5d"}])
    print g.m.competingfun.getLifeNum(uid)