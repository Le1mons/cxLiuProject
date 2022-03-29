#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g
from ZBFight import ZBFight

'''
每日试练——挑战
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _type = str(data[0])
    _npcId = str(data[3])

    # 玩家等级小于开放等级
    if not g.chkOpenCond(uid, 'meirishilian'):
        _res['s'] = -3
        _res['errmsg'] = g.L('mrsl_fight_res_-3')
        return _res

    _difficulty = str(data[1])
    # 不存在的类型
    if _type not in g.GC['meirishilian']:
        _res['s'] = -2
        _res['errmsg'] = g.L('mrsl_fight_res_-2')
        return _res

    _lessNum = g.m.mrslfun.getLessNum(uid, _type)
    # 剩余次数小于0
    if _lessNum <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsl_fight_res_-1')
        return _res

    # 战斗参数
    _fightData = data[2]
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _npcCon = g.GC['npc']
    # NPC不存在
    if _npcId not in _npcCon:
        _res['s'] = -4
        _res['errmsg'] = g.L('mrsl_fight_res_-4')
        return _res

    # _bossFightData = g.m.npcfun.getNpcById(_npcId)
    _bossFightData = g.m.fightfun.getNpcFightData(_npcId)
    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    if _winside == 0:
        g.m.mrslfun.addPkNum(uid, _type)
        _prize = g.m.mrslfun.getMrslCon(_type, _difficulty)['prize']
        # 暴击概率
        _proba = g.m.mrslfun.getCritProba(_type)
        _prize *= _proba
        _sendData = g.getPrizeRes(uid, _prize,act='mrsl_fight')
        g.sendChangeInfo(conn, _sendData)

        _resData.update({'prize': _prize})
        # 监听每日试炼完成
        g.event.emit('mrsl_fight', uid)
        # # g.m.taskfun.chkTaskHDisSend(uid)
        # 神器任务
        g.event.emit('artifact', uid, 'meirishilian')
        g.event.emit("dailytask", uid, 11)
        _lessNum -= 1
    _resData.update({'lessnum':_lessNum})

    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('666')
    a = {1: "5b6d2c7dc0911a0d84d65a7a", 2: "5b6cef9cc0911a2d786f2f71", 3: "5b6d3774c0911a1cb46bb713", 'sqid': 1}
    data = ["jinbi","1",a,"25"]
    print doproc(g.debugConn, data)