#!/usr/bin/python
# coding:utf-8
'''
竞技场 - fight
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g,time
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn:
    :param data: [对手uid:str, 防守阵容:{}]
    :return:
    ::

        {'d': {'jifenchange':{积分改变信息},'flop':{'prize':获得的奖励,'show':[展示奖励]},'fightres':{战斗结果}},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 对手信息
    _enemyUid = data[0]
    # 英雄的站位信息
    _fightData = data[1]
    
    _jumpFight = 0
    if len(data)>3:
        _jumpFight = int(data[2])

    #防止机器脚本刷战斗
    _cacheKey = "zypkjjc_fight_" + str(uid)
    _cacheInfo = g.mc.get(_cacheKey)
    _nt = time.time()
    _cdTime = 2
    if _cacheInfo!=None and _nt - _cacheInfo<_cdTime:
        _res['s']=-5
        _res['errmsg'] = g.L("休息一下下吧")
        return _res
    g.mc.set(_cacheKey,_nt,5)
    
    # 检查当前时间是否是关闭时间
    _nt = g.C.NOW()
    _con = g.GC['zypkjjccom']['base']
    _closeTime = _con['closetime']
    _ntWeek = g.C.getWeekFirstDay(_nt)
    # 当前时间是周末22点后  关闭时间
    if _ntWeek + _closeTime < _nt:
        _res['s'] = -2
        _res['errmsg'] = g.L('zypkjjc_fight_res_-2')
        return _res

    # 如果不是npc
    if not _enemyUid.startswith('npc'):
        # 对手的hero站位信息
        _Info = g.mdb.find('zypkjjc', {'uid': {'$in': [uid, _enemyUid]}}, fields=['_id', 'defhero', 'jifen', 'uid','zhanli'])
        if len(_Info) != 2:
            _res['s'] = -10
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _myInfo, _enemyInfo = None, None
        for i in _Info:
            if i['uid'] == uid:
                _myInfo = i
            else:
                _enemyInfo = i

        _enemyData = _enemyInfo.get('defhero', {})
        _enemyJifen = _enemyInfo['jifen']

        # 防守阵容不存在 清除竞技场数据
        if not _enemyData:
            g.mdb.delete('zypkjjc', {'uid': _enemyUid})
            g.delAttr(uid, {'ctype': 'zypkjjc_fightuser'})
            _res['s'] = -30
            _res['errmsg'] = g.L('zypkjjc_fight_res_-3')
            return _res

        # 检查对手的信息
        _chkEnemyData = g.m.fightfun.chkFightData(_enemyUid, _enemyData, side=1)
        if _chkEnemyData['chkres'] < 1:
            if len(_enemyData) in (1, 0):
                # 如果只有神器或者都没有
                g.mdb.delete('zypkjjc', {'uid': _enemyUid})
            else:
                # 修复防守阵容
                g.m.zypkjjcfun.getDefHeroInfo(_enemyUid, 'zypkjjc')
            _res['s'] = _chkEnemyData['chkres']
            _res['errmsg'] = g.L('zypkjjc-3')
            return _res

        _enemyFightData = g.m.fightfun.getUserFightData(_enemyUid, _chkEnemyData['herolist'], 1,sqid=_enemyData.get('sqid'))
    else:
        _enemyJifen = 1000
        _myInfo = g.mdb.find1('zypkjjc', {'uid': uid}, fields=['_id', 'defhero', 'jifen', 'uid','zhanli']) or {}
        _data = g.getAttrByCtype(uid, 'zypkjjc_fightuser', bydate=False, default=[])
        _chkEnemyData = {}
        _enemyInfo = {}
        _enemyFightData = []
        for i in _data:
            if i['uid'] == _enemyUid:
                _enemyFightData = i['defhero']
                _chkEnemyData['headdata'] = i['headdata']
                _chkEnemyData['zhanli'] = _enemyInfo['zhanli'] = i['zhanli']
                break
        # 如果不存在就提示，重新刷新对手
        if not _chkEnemyData:
            _enemy = g.m.zypkjjcfun.refPkUser(uid)
            g.m.zypkjjcfun.setPkUserList(uid, _enemy)
            _res['s'] = -11
            _res['errmsg'] = g.L('global_argserr')
            return _res

    _jifen = _myInfo.get('jifen', 1000)
    _enemyData = _enemyInfo.get('defhero', {})
    # 防守阵容不存在
    if not _fightData:
        _res['s'] = -3
        _res['errmsg'] = g.L('zypkjjc_fight_res_-3')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 检查对手的信息
    # _chkEnemyData = g.m.fightfun.chkFightData(_enemyUid, _enemyData)
    # if _chkEnemyData['chkres'] < 1:
    #     if len(_enemyData) in (1,0):
    #         # 如果只有神器或者都没有
    #         g.mdb.delete('zypkjjc', {'uid': _enemyUid})
    #     else:
    #         # 修复防守阵容
    #         getDefHeroInfo(_enemyUid, 'zypkjjc')
    #     _res['s'] = _chkEnemyData['chkres']
    #     _res['errmsg'] = g.L('zypkjjc-3')
    #     return _res

    # 己方获取荣誉币
    _prize = _con['pkprize']

    _fightNum = g.m.zypkjjcfun.getFreeCanPkNum(uid)
    # 免费次数已用完
    if _fightNum <= 0:
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

        _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'zypkjjc_fight_del'})
        g.sendChangeInfo(conn, _sendData)

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # 第一次挑战 降低对手所有属性到百分之10
    _firstOpen = g.getAttrOne(uid,{'ctype':'zypkjjc_firstfight'})
    if not _firstOpen:
        _enemyFightData = g.m.fightfun.changeHeroBuff(_enemyFightData, 0.1)
        g.setAttr(uid,{'ctype':'zypkjjc_firstfight'},{'v':1})

    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _enemyFightData).start()

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    # _fightRes['headdata'] = [_chkFightData['headdata'], _chkEnemyData['headdata']]
    _fightRes['headdata'] = [_chkFightData['headdata'], _chkEnemyData['headdata']]
    _winside = _fightRes['winside'] = _fightRes['winside'] if _fightRes['winside'] != -2 else 1
    _resData = {'fightres': _fightRes}

    _addJifen, _rmJifen = g.m.zypkjjcfun.getChangeJifen(_jifen, _enemyJifen,winside=_winside)

    if _winside == 0:
        _newJifen = _jifen + _addJifen
        _newEnemyJifen = _enemyJifen + _rmJifen if _enemyJifen + _rmJifen > 0 else 0

        # 监听自由竞技场积分变化
        g.event.emit("ZyjjcScore", uid, val=_newJifen, gt=True)
        # 监听自由竞技场获胜次数
        g.event.emit("ZyjjcWin", uid)
        # 战旗任务
        g.event.emit("FlagTask", uid, ['204', '305'])

        # 节日狂欢
        g.event.emit('jierikuanghuan', uid, '10')

        g.event.emit('kfkh', uid, 15, 3, _newJifen)

        _PMDjifen = _newJifen
        _PMDuid = uid
        _PMDzhanli = _chkFightData['zhanli']
        _jifenInfo = [{'jifen': _jifen, 'change': _addJifen}, {'jifen': _enemyJifen, 'change': _rmJifen}]
    else:
        _newJifen = _jifen + _rmJifen if _jifen + _rmJifen > 0 else 0
        _newEnemyJifen = _enemyJifen + _addJifen
        _PMDjifen = _newEnemyJifen
        _PMDuid = _enemyUid
        _PMDzhanli = _chkEnemyData['zhanli']
        _jifenInfo = [{'jifen': _jifen, 'change': _rmJifen}, {'jifen': _enemyJifen, 'change': _addJifen}]

        # 非npc
        if not _enemyUid.startswith('npc'):
            # 监听自由竞技场积分变化
            g.event.emit("ZyjjcScore", _enemyUid, val=_newEnemyJifen, gt=True)
            # 监听自由竞技场获胜次数
            g.event.emit("ZyjjcWin", _enemyUid)
            # 战旗任务
            # g.event.emit("FlagTask", _enemyUid, ['204', '305'])
            g.event.emit('kfkh', _enemyUid, 15, 3, _newEnemyJifen)

            # 节日狂欢
            # g.event.emit('jierikuanghuan', _enemyUid, '10')

    # 获取战斗后的奖励
    _resPrize = g.m.diaoluofun.getGroupPrizeNum(_con['diaoluozu'])
    _resData.update({'flop': _resPrize})
    # _sendData = g.getPrizeRes(uid, _resPrize, act={'act': 'zypkjjc_fight', 'prize': _resPrize})
    # g.sendChangeInfo(conn, _sendData)

    _first = g.mdb.find1('zypkjjc', sort=[['jifen', -1], ['lattime', 1]],fields=['_id','uid','jifen','zhanli'])
    # 胜者之前是第一名 但是积分小于1400   或者  之前不是第一名  现在的积分大于之前的第一名 如果积分相等战力就必须大于之前的第一名
    if _PMDjifen>=1400 and ((_first['uid']==_PMDuid and _first['jifen']<1400) or (_first['uid']!=_PMDuid and (_PMDjifen>_first['jifen'] or (_PMDjifen==_first['jifen'] and _PMDzhanli>_first['zhanli'])))):
        gud = g.getGud(_PMDuid)
        g.m.chatfun.sendPMD(uid, 'zyjjctop', gud['name'])

    g.m.zypkjjcfun.setUserJJC(uid, {"jifen": _newJifen})
    if not _enemyUid.startswith('npc_'):
        g.m.zypkjjcfun.setUserJJC(_enemyUid, {"jifen": _newEnemyJifen})

    # 增加挑战次数
    g.m.zypkjjcfun.setPkNumByWeek(uid)
    if _fightNum > 0: g.m.zypkjjcfun.setFreePkNum(uid)
    # 设置战斗记录
    _jifenChange = {'jifen': _newJifen, 'add': _addJifen, 'reduce': _rmJifen, 'rivaljifen': _newEnemyJifen,'win_uid':_PMDuid}
    _data = {
        'fightres':_fightRes,
        "jifenchange":_jifenChange,
        "jifeninfo":_jifenInfo
    }
    g.m.zypkjjcfun.setFightRecording(uid, _enemyUid,_data)

    _sendData = g.getPrizeRes(uid, list(_prize) + _resPrize, act={'act':'zypkjjc_fight'})
    g.sendChangeInfo(conn, _sendData)
    # g.getPrizeRes(_enemyUid, _prize, act={'act':'zypkjjc_fight','prize':_prize})
    # 监听竞技场挑战日常
    g.event.emit('dailytask', uid, 9)

    _resData.update({'jifenchange': _jifenChange})
    # g.m.taskfun.chkTaskHDisSend(uid)
    _res['d'] = _resData
    
    if _jumpFight:
        if 'fightlog' in _resData['fightres']:del _resData['fightres']['fightlog']
        if 'roles' in _resData['fightres']:del _resData['fightres']['roles']
        if 'fightres' in _resData['fightres']:del _resData['fightres']['fightres']
        if 'signdata' in _resData['fightres']:del _resData['fightres']['signdata']
        
    # 神器任务
    g.event.emit('artifact', uid, 'jjc')

    # 英雄人气冲榜
    g.event.emit('herohottask', uid, '1')

    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['3001', '3002', '3003', '3004'], 'liwu': ['3']})

    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '5')
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    data2 = ["28700_5e9991cb0c016939521e0981",{1: "5f49f71c0c01691da49e33a4",
2: "5f49f71c0c01691da49e33c8",
3: "5f49f71c0c01691da49e33bb",
4: "5f49f71c0c01691da49e339b",
5: "5f49f71c0c01691da49e33ab",
6: "5f49f71c0c01691da49e33b9"},0]
    print doproc(g.debugConn, data=data2)