#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 战斗
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append('game')
import g
from ZBFight import ZBFight

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [是否挑战水晶:bool, 防守阵容:{}, 敌方阵营:str]
    :param key:
    :return:
    ::
        {'s': 1}


    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    return
    _chkData = {}
    _chkData["s"] = 1
    _con = g.GC['five_army']['base']
    # 开区天数不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 每天十点不能打
    if not 8 <= g.C.HOUR() < 22:
        _chkData['s'] = -12
        _chkData['errmsg'] = g.L('wjzz_fight_-1')
        return _chkData

    _nt = g.C.NOW()
    # 非挑战期间
    if not _con['time']['fight'][0] <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['fight'][1]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 等级不足
    if not g.chkOpenCond(uid, 'wjzz'):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    # 没有报名了
    if not g.m.wjzzfun.chkUserIsSignUp(uid):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('wjzz_signup_-2')
        return _chkData

    _faction = str(data[2])
    _own = g.m.wjzzfun.getUserData(uid)
    # 不能攻打己方阵容
    if _own['faction'] == _faction:
        _chkData['s'] = -10
        _chkData['errmsg'] = g.L('wjzz_fight_-10')
        return _chkData

    _fightData = data[1]
    # 英雄疲劳值
    _status = g.getAttrByDate(uid, {'ctype': 'wjzz_status'}) or [{}]
    _pilao, _dead = _status[0].get('pilao', {}), _status[0].get('v', {})
    _tids = []
    for i in _fightData:
        if i == 'sqid':
            continue
        # 英雄过度疲劳
        if _pilao.get(_fightData[i], 0) >= _con['pilao']:
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('wjzz_fight_-5')
            return _chkData

        # 英雄挂了
        # if _fightData[i] in _dead and _dead[_fightData[i]].get('hp', 100) <= 0:
        #     _chkData['s'] = -6
        #     _chkData['errmsg'] = g.L('wjzz_fight_-6')
        #     return _chkData

        _tids.append(g.mdb.toObjectId(_fightData[i]))
        _pilao[_fightData[i]] = _pilao.get(_fightData[i], 0) + 1

    _heros = g.mdb.find('hero',{'uid':uid,'_id':{'$in':_tids},'star':{'$gte':_con['star']}})
    # 只有8星以上的英雄才能上场
    # if len(_tids) != len(_heros):
    #     _chkData['s'] = -7
    #     _chkData['errmsg'] = g.L('wjzz_signup_-20')
    #     return _chkData

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData, herodata=_heros)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    _season = g.m.wjzzfun.getSeasonNum()
    # 挑战对手
    if not data[0]:
        _rival = g.m.wjzzfun.getRival(uid, _faction)
        # 对手已经死光了
        if 'res' in _rival and not _rival['res']:
            _chkData['s'] = -8
            _chkData['errmsg'] = g.L('wjzz_rival_-4')
            return _chkData

        # 对方驻防部队已经死光了
        if _rival.get('dead'):
            g.m.wjzzfun.getRival(uid, _faction, 1)
            _chkData['s'] = -9
            _chkData['errmsg'] = g.L('wjzz_rival_-4')
            return _chkData

        # 加个锁
        if g.crossMC.get('wjzz_zlfight_{0}_{1}'.format(_rival['uid'],_rival['team'])):
            _chkData['s'] = -12
            _chkData['errmsg'] = g.L('wjzz_fight_-12')
            return _chkData

        g.crossMC.set('wjzz_zlfight_{0}_{1}'.format(_rival['uid'],_rival['team']), 1, 1)
        _chkData['rival'] = _rival
    else:
        # 敌人还没死完
        _crystal = g.crossDB.find1('wjzz_crystal', {'key':_season,'group':_own['group'],'faction':_faction},fields=['_id','live'])
        if _crystal['live'] > 0:
            _chkData['s'] = -11
            _chkData['errmsg'] = g.L('wjzz_fight_-11')
            return _chkData

    _chkData['fight'] = _chkFightData
    _chkData['season'] = _season
    _chkData['own'] = _own
    _chkData['pilao'] = _pilao
    _chkData['status'] = _dead
    _chkData['con'] = _con
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkData['fight']['herolist'], 0, sqid=data[1].get('sqid'))
    # 挑战对手
    if not data[0]:
        _RivalHero = _chkData['rival']['data']
        _mode = 'pvp'
        _headdata = _chkData['rival']['headdata']
    else:
        _RivalHero = list(_chkData['con']['boss'])
        _mode = 'pve'
        _headdata = _chkData['con']['headdata']

    f = ZBFight(_mode)
    f.initFightByData(_userFightData + _RivalHero)
    # 继承血量
    _myHpStatus, _myNuqiStatus = {}, {}
    for pos in data[1]:
        if data[1][pos] in _chkData['status']:
            _myHpStatus[pos] = _chkData['status'][data[1][pos]]['hp']
            _myNuqiStatus[pos] = _chkData['status'][data[1][pos]]['nuqi']

    f.setSZJRoleHp(0, _myHpStatus)
    f.setRoleNuqi(0, _myNuqiStatus)

    # 对手的状态
    if not data[0] and 'status' in _chkData['rival']:
        f.setSZJRoleHp(1, _chkData['rival']['status'])

    _fightRes = f.start()
    _fightRes['headdata'] = [_chkData['fight']['headdata'], _headdata]
    _winside = _fightRes['winside']
    _resData = {'fightres': _fightRes}
    if _winside == 0:
        # 挑战对手 胜利
        if not data[0]:
            _r = g.crossDB.update('wjzz_crystal',{'group':_chkData['own']['group'],'faction':str(data[2]),'key':_chkData['season'],'live':{'$gt':0}},{'$inc':{'live':-1},'$set':{'lasttime':g.C.NOW()}})
            # 对手被打死了
            if not _r['updatedExisting']:
                g.m.wjzzfun.getRival(uid, str(data[2]), 1)
                _chkData['s'] = -9
                _chkData['errmsg'] = g.L('wjzz_rival_-4')
                return _chkData

            # 设置死亡标识
            g.crossDB.update('wjzz_defend',{'uid':_chkData['rival']['uid'],'key':_chkData['season'],'team':_chkData['rival']['team']},{'dead':1})
            # 刷新对手
            g.m.wjzzfun.getRival(uid, str(data[2]), 1)

        # 增加连击数量
        g.crossDB.update('wjzz_data',{'key':_chkData['season'],'group':_chkData['own']['group'],'uid':uid},{'$inc':{'num': 1},'$set':{'lasttime':g.C.NOW()}})

        # 检测是否发送系统播报
        _numData = g.crossDB.find1('wjzz_data',{'key':_chkData['season'],'group':_chkData['own']['group'],'uid':uid},fields=['_id','num'])
        if _numData['num'] % 5 == 0:
            gud = g.getGud(uid)
            content = g.L('wjzz_chat',g.L(_chkData['own']['faction']),gud['name'],g.L(str(data[2])),_headdata['name'],_numData['num'])
            g.m.crosschatfun.chatRoom.addCrossChat({'msg': content, 'mtype': 5, 'fdata': {'key':_chkData['own']['group']}, 'extarg': {'ispmd':1}})

    # 打输了
    else:
        # 需要设置对手的剩余状态
        if not data[0]:
            # 记录对手的残余状态
            _fightLess = {}
            for k, v in _fightRes['fightres'].items():
                for i in _RivalHero:
                    # 对方角色
                    if v['side'] == 1 and 'hid' in v and 'hid' in i and v['pos'] == i['pos']:
                        _fightLess[str(i['pos'])] = int(v['hp'] * 100.0 / v['maxhp'])

                        # 如果pos是7 并且 大于0
                        if k in _fightRes['roles'] and _fightRes['roles'][k]['pos'] == 7 and _fightRes['fightres'][k]['pos'] != 7:
                            _fightLess['yj'] = v['pos']

            g.crossDB.update('wjzz_defend', {'uid': _chkData['rival']['uid'], 'key': _chkData['season']},{'status': _fightLess})

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)
    if data[0]:
        # 给水晶加伤害
        g.crossDB.update('wjzz_crystal',{'key':_chkData['season'],'group':_chkData['own']['group'],'faction':str(data[2])},{'$inc':{'num':_fightRes['dpsbyside'][0]},'$set':{'lasttime':g.C.NOW()}})


    # 记录自己的残余状态
    _status = _chkData['status']
    for k, v in _fightRes['fightres'].items():
        # 己方角色
        if v['side'] == 0 and 'hid' in v:
            _pos = v['pos']
            _tid = data[1][str(_pos)]
            _status[_tid] = {'hp': int(v['hp'] * 100.0 / v['maxhp']), 'nuqi': v['nuqi']}

    # 添加日志
    _log = {
        "from": _chkData['own']['faction'],
        "group": _chkData['own']['group'],
        "to":str(data[2]),
        "dps":_fightRes['dpsbyside'],
        "winside":_winside,
        "name":_headdata['name'],
        "ctime":g.C.NOW(),
        "ttltime":g.C.TTL(),
        "type":data[0],
        "key":_chkData['season']
    }
    g.crossDB.insert('wjzz_log', _log)

    # 设置疲劳值 和 状态
    g.setAttr(uid, {'ctype': 'wjzz_status'}, {'pilao':_chkData['pilao'], 'v': _status})
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    fight = {"1":'5e9025bb9dc6d67cf8308c04'}
    _data = [0, fight, '3']
    print doproc(g.debugConn, _data)