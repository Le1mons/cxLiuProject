#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g
from ZBFight import ZBFight

'''
竞技场 - fight
'''


def proc(conn, data):
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

    # 对手的hero站位信息
    _Info = g.mdb.find('zypkjjc', {'uid': {'$in':[uid, _enemyUid]}},fields=['_id','defhero','jifen','uid'])
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

    _jifen = _myInfo.get('jifen', 1000)
    _enemyData = _enemyInfo.get('defhero', {})
    _enemyJifen = _enemyInfo['jifen']
    # 防守阵容不存在
    if not _fightData or not _enemyData:
        _res['s'] = -3
        _res['errmsg'] = g.L('zypkjjc_fight_res_-3')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 检查对手的信息
    _chkEnemyData = g.m.fightfun.chkFightData(_enemyUid, _enemyData)
    if _chkEnemyData['chkres'] < 1:
        _res['s'] = _chkEnemyData['chkres']
        _res['errmsg'] = g.L(_chkEnemyData['errmsg'])
        return _res

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
    _enemyFightData = g.m.fightfun.getUserFightData(_enemyUid, _chkEnemyData['herolist'], 1, sqid=_enemyData.get('sqid'))
    # 第一次挑战 降低对手所有属性到百分之10
    _firstOpen = g.getAttrOne(uid,{'ctype':'zypkjjc_firstfight'})
    if not _firstOpen:
        _enemyFightData = g.m.fightfun.changeHeroBuff(_enemyFightData, 0.1)
        g.setAttr(uid,{'ctype':'zypkjjc_firstfight'},{'v':1})

    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _enemyFightData).start()

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

    g.event.emit('kfkh',uid,15,3,_newJifen)
    # 获取战斗后的奖励
    _dlzId = _con['diaoluozu']
    _resPrize = {'prize': [], 'show': []}
    for i in xrange(3):
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        if i == 0:
            _resPrize['prize'] += _prize
            _sendData = g.getPrizeRes(uid, _prize, act={'act':'zypkjjc_fight_flop','prize':_prize})
            g.sendChangeInfo(conn, _sendData)
        else:
            _resPrize['show'] += _prize
    _resData.update({'flop': _resPrize})

    _first = g.mdb.find1('zypkjjc', sort=[['jifen', -1], ['lattime', 1]],fields=['_id','uid','jifen','zhanli'])
    # 胜者之前是第一名 但是积分小于1400   或者  之前不是第一名  现在的积分大于之前的第一名 如果积分相等战力就必须大于之前的第一名
    if _PMDjifen>=1400 and ((_first['uid']==_PMDuid and _first['jifen']<1400) or (_first['uid']!=_PMDuid and (_PMDjifen>_first['jifen'] or (_PMDjifen==_first['jifen'] and _PMDzhanli>_first['zhanli'])))):
        gud = g.getGud(_PMDuid)
        g.m.chatfun.sendPMD(uid, 'zyjjctop', gud['name'])

    g.m.zypkjjcfun.setUserJJC(uid, {"jifen": _newJifen})
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

    # 己方获取荣誉币
    _prize = _con['pkprize']
    _sendData = g.getPrizeRes(uid, list(_prize), act={'act':'zypkjjc_fight','prize':list(_prize)})
    g.sendChangeInfo(conn, _sendData)
    # g.getPrizeRes(_enemyUid, _prize, act={'act':'zypkjjc_fight','prize':_prize})
    # 监听竞技场挑战日常
    g.event.emit('dailytask', uid, 9)

    _resData.update({'jifenchange': _jifenChange})
    # g.m.taskfun.chkTaskHDisSend(uid)
    _res['d'] = _resData
    # 神器任务
    g.event.emit('artifact', uid, 'jjc')
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data2 = ["0_5c171125e138231eb226deee",{"1": "5c29c0b7c0911a34646bae77",
"2": "5c3a041ec0911a37dc3a580c",
"3": "5c29d456c0911a34f049d958",
"4": "5c29d453c0911a34f049d872",
"5": "5c3a0421c0911a37dc3a58b8",
"6": "5c31e649c0911a101028da95"}]
    print doproc(g.debugConn, data=data2)