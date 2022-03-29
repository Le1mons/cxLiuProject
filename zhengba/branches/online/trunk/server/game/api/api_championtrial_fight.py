# !/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g
from ZBFight import ZBFight

'''
冠军的试练 - 挑战
'''


def proc(conn, data):
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
    _teamData = data[1]

    # 须上阵三个队伍
    for i in _teamData:
        if not i:
            _res['s'] = -1
            _res['errmsg'] = g.L('championtrial_fight_res_-1')
            return _res

    if len(_teamData) < 3:
        _res['s'] = -2
        _res['errmsg'] = g.L('championtrial_fight_res_-1')
        return _res

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
        _need = g.GC['championtrial']['base']['pkneed']
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

    # 开始3回合的挑战
    _fightResList = []
    _myZhanli,_rivalZhanli = 0,0
    _winNum, _loseNum = 0, 0
    _isJump = 0
    for i in xrange(3):
        _fightData = _teamData[i]
        _rivalData = _rival_teamData[i]
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
        _chkRivalData = g.m.fightfun.chkFightData(_rivalUid, _rivalData)
        if _chkFightData['chkres'] < 1:
            _winNum = 2
            break
        _rivalZhanli += _chkRivalData['zhanli']
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
        _rivalFightData = g.m.fightfun.getUserFightData(_rivalUid, _chkRivalData['herolist'], 1, sqid=_rivalData.get('sqid'))

        # 记录headdata
        f = ZBFight('pvp')
        _fightRes = f.initFightByData(_userFightData + _rivalFightData).start()
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
    _first = g.mdb.find1('zypkjjc', sort=[['jifen', -1], ['lattime', 1]],fields=['_id','uid','jifen','zhanli'])
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

    _res['d'] = {'jifenchange': _jifenChange, 'flop': _resPrize, 'fightres': _fightResList,'isjump':_isJump,
                 'win_uid':_PMDuid}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    _a = {"1": "5b18f251c0911a1ff8a26193"}
    print doproc(g.debugConn, data=['0_5aec54eb625aee6374e25e0c', 1])