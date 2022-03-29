# !/usr/bin/python
# coding:utf-8
'''
冠军的试练 - 挑战
'''


import sys,time
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g
from ZBFight import ZBFight

def getEnemyFightData(uid, fightdata):
    _res = g.mc.get('championtrial_enemydata_{}'.format(uid)) or {}
    if not _res:
        _res['zhanli'] = 0
        _res['res'] = {}
        _tids = {}
        for i in ('0', '1', '2'):
            _tids[i] = [fightdata[int(i)][x] for x in fightdata[int(i)] if x not in ('sqid', 'pet')]

        _chk = {'0':[],'1':[],'2':[]}
        _heroList = g.m.herofun.getMyHeroList(uid, where={'_id':{'$in': map(g.mdb.toObjectId, _tids['0']+_tids['1']+_tids['2'])}})
        for i in _heroList:
            for j in _chk:
                if str(i['_id']) in _tids[j]:
                    _chk[j].append(i)

        _lose = 0
        for i in ('0', '1', '2'):
            _chkFightData = g.m.fightfun.chkFightData(uid, fightdata[int(i)], herodata = _chk[i], side=1)
            if _chkFightData['chkres'] < 1 or not _chkFightData['herolist']:
                _res['res'][i] = []
            else:
                _res['res'][i] = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1, sqid=fightdata[int(i)].get('sqid'))
                _res['zhanli'] += _chkFightData['zhanli']

        g.mc.set('championtrial_enemydata_{}'.format(uid), _res, 10)
    return _res

def proc(conn, data):
    """

    :param conn:
    :param data: [对手uid:str, 上阵阵容:list [{每一队的防守阵容}]]
    :return:
    ::

        {'d': {'jifenchange':{add:增加的积分,reduce:减少的积分,jifen:我的最终积分,rival:对手的最终积分,win_uid:获胜者的uid},
                'flop':{prize:最终获得的奖励, show: 附加显示给玩家看的奖励},
                "isjump":是否因为对方阵容少队伍而跳过,
                'fightres':{战斗结果},
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
    # 对手的uid
    _rivalUid = data[0]
    # 上阵阵容
    _team = data[1]
    # 获取之前的缓存
    _teamData = g.mc.get('champion_fight_{}'.format(uid)) or []
    _teamData.append(_team)
    if len(_teamData) < 3:
        g.mc.set('champion_fight_{}'.format(uid), _teamData, 60)
        return _res

    g.mc.delete('champion_fight_{}'.format(uid))
    _teamData = _teamData[-3:]

    # 必须规定时间内
    _con = g.GC['championtrial']['base']
    _nt = g.C.NOW()
    if not _con['opentime']+g.C.getWeekFirstDay(_nt) <= _nt <= g.C.getWeekFirstDay(_nt)+ _con['colsetime']:
        _res['s'] = -11
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 须上阵三个队伍
    for i in _teamData:
        if not i:
            _res['s'] = -1
            _res['errmsg'] = g.L('championtrial_fight_res_-1')
            return _res

    # 须上阵三个队伍
    if len(_teamData) < 3:
        _res['s'] = -2
        _res['errmsg'] = g.L('championtrial_fight_res_-1')
        return _res

    # 检查重复英雄
    if not g.m.championfun.checkRepeatHero(_teamData):
        _res['s'] = -1
        _res['errmsg'] = g.L('championtrial_defend_res_-1')
        return _res

    #防止机器脚本刷战斗
    _cacheKey = "championtrial_fight_" + str(uid)
    _cacheInfo = g.mc.get(_cacheKey)
    _nt = time.time()
    _cdTime = 5
    if _cacheInfo!=None and _nt - _cacheInfo<_cdTime:
        _res['s']=-5
        _res['errmsg'] = g.L("休息一下下吧")
        return _res
    g.mc.set(_cacheKey,_nt)

    _rivalInfo = g.mdb.find1('championtrial', {'uid': _rivalUid})
    if _rivalInfo:
        _rival_teamData = _rivalInfo.get('defhero', {})
        _rivalJifen = _rivalInfo['jifen']
    else:
        _rival_teamData = {}
        _rivalJifen = g.GC['championtrial']['base']['initjifen']

    # 防守阵容不存在
    if not _rival_teamData:
        _res['s'] = -2
        _res['errmsg'] = g.L('championtrial_fight_res_-2')
        return _res

    _freeNum = g.m.championfun.getFreeCanPkNum(uid)
    # 没有免费挑战次数
    if _freeNum <= 0:
        _need = _con['pkneed']
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

    _rivalData = getEnemyFightData(_rivalUid, _rival_teamData)

    # 开始3回合的挑战
    _fightResList = []
    _myZhanli,_rivalZhanli = 0,_rivalData['zhanli']
    _winNum, _loseNum = 0, 0
    _isJump = 0

    for i in xrange(3):
        _fightData = _teamData[i]
        # 如果对方阵容不满三队  直接胜利
        if len(_rival_teamData) <= 2:
            _winNum = 2
            _isJump = 1
            break

        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res
        _myZhanli += _chkFightData['zhanli']
        # 检查对手的信息 有hero不存在就直接勝利
        # _chkRivalData = g.m.fightfun.chkFightData(_rivalUid, _rivalData)
        # if _chkFightData['chkres'] < 1:
        #     _winNum = 2
        #     break
        # _rivalZhanli += _chkRivalData['zhanli']
        # if not _rivalData['res'][str(i)]:
        #     _winNum += 1
        #     continue
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))

        # 记录headdata
        f = ZBFight('pvp')
        _fightRes = f.initFightByData(_userFightData + _rivalData['res'][str(i)]).start()

        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

        _fightRes['headdata'] = [_chkFightData['headdata'], g.m.userfun.getShowHead(_rivalUid)]

        _fightResList.append(_fightRes)
        # if _fightRes['winside'] == -2: _fightRes['winside'] = 1
        _winside = _fightRes['winside']
        if _winside == 0:
            _winNum += 1
        else:
            _loseNum += 1
        # 有一方赢两次就跳出循环
        if _winNum >= 2 or _loseNum >= 2:
            break

    # 如果不是免费就扣除消耗
    if _freeNum <= 0:
        _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'championtrial_fight'})
        g.sendChangeInfo(conn, _sendData)

    _jifen = g.m.championfun.getChampionJifen(uid)

    # 己方胜利
    if _winNum >= 2:
        _addJifen, _rmJifen = g.m.championfun.getChangeJifen(_jifen, _rivalJifen, 0)

        _jifen += _addJifen
        _rivalJifen = _rivalJifen + _rmJifen if _rivalJifen + _rmJifen > 0 else 0
        _jifenInfo = [{'jifen': _jifen, 'change': _addJifen}, {'jifen': _rivalJifen, 'change': _rmJifen}]

        _PMDjifen = _jifen
        _PMDuid = uid
        _PMDzhanli = _myZhanli
    else:
        _addJifen, _rmJifen = g.m.championfun.getChangeJifen(_jifen, _rivalJifen, 1)

        _jifen = _jifen + _rmJifen if _jifen + _rmJifen > 0 else 0
        _rivalJifen += _addJifen
        _jifenInfo = [{'jifen': _jifen, 'change': _rmJifen}, {'jifen': _rivalJifen, 'change': _addJifen}]

        _PMDjifen = _rivalJifen
        _PMDuid = _rivalUid
        _PMDzhanli = _rivalZhanli
    # 跑马灯   没有更大的积分就说明是第一名
    _first = g.mdb.find1('championtrial', sort=[['jifen', -1], ['lattime', 1]],fields=['_id','uid','jifen','zhanli'])
    # 胜者之前是第一名 但是积分小于1400   或者  之前不是第一名  现在的积分大于之前的第一名 如果积分相等战力就必须大于之前的第一名
    if _PMDjifen>=1400 and ((_first['uid']==_PMDuid and _first['jifen']<1400) or (_first['uid']!=_PMDuid and (_PMDjifen>_first['jifen'] or (_PMDjifen==_first['jifen'] and _PMDzhanli>_first['zhanli'])))):
        gud = g.getGud(_PMDuid)
        g.m.chatfun.sendPMD(uid, 'zyjjctop', gud['name'])

    g.m.championfun.setUserJJC(uid, {"jifen": _jifen})
    g.m.championfun.setUserJJC(_rivalUid, {"jifen": _rivalJifen})

    # 添加录像
    _jifenChange = {'add': _addJifen, 'reduce': _rmJifen, 'jifen': _jifen, 'rivaljifen': _rivalJifen,'win_uid':_PMDuid}
    g.m.championfun.setFightRecording(uid, _rivalUid, _fightResList, _jifenInfo, _jifenChange)

    if _freeNum > 0: g.m.championfun.setFreePkNum(uid)

    # 获取战斗后的奖励
    _con = g.GC['championtrial']['base']
    _dlzId = _con['diaoluozu']
    _resPrize = {'prize': [], 'show': []}
    for i in xrange(3):
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        if i == 0:
            _resPrize['prize'] += _prize
            _sendData = g.getPrizeRes(uid, _prize+list(_con['pkprize']), act={'act':'championtrial_fight','prize':_prize})
            g.sendChangeInfo(conn, _sendData)
        else:
            _resPrize['show'] += _prize

    _res['d'] = {'jifenchange': _jifenChange, 'flop': _resPrize, 'fightres': _fightResList,'isjump':_isJump,'win_uid':_PMDuid}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    _a = ["0_5cf305fc9dc6d629022e17b5",[{"1":"5cfd3143c0911a4888343060"},{"1":"5cfd3142c0911a488834301d"},{"1":"5cfd3142c0911a4888343042"}]]
    print doproc(g.debugConn, data=_a)