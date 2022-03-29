#!/usr/bin/python
# coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g
from ZBFight import ZBFight

'''
公会 - 团队任务战斗
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 战斗参数
    _fightData = data[0]
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        # 无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    if int(g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)) <= 60:
        # 必须打通关60关副本
        _res['s'] = -7
        _res['errmsg'] = g.L('gonghui_golbal_fberr')
        return _res


    _user = g.mdb.find1('gonghuiuser',{'uid':uid},fields=['_id','ctime'])
    # 新入会玩家无法挑战
    if not _user or g.C.ZERO(_user['ctime'])+24*3600 > g.C.NOW() and g.config['OWNER'] not in ('wwceshi',):
        _res['s'] = -6
        _res['errmsg'] = g.L('teamtask_fight_-6')
        return _res

    _fubenData = g.mdb.find1('gonghuiattr', {'ghid': _ghid, 'ctype': 'teamtask_leader'}, sort=[['k', -1]], fields=['_id','pos2hp','maxhp','uid2dps','ispass','v'])
    if not _fubenData or _fubenData.get('ispass'):
        # 没有boss
        _res['s'] = -2
        _res['errmsg'] = g.L('teamtask_fight_res_-2')
        return _res

    if 'ispass' in _fubenData:
        # 已经通关
        _res['s'] = -5
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-5')
        return _res

    # 当天挑战过boss的次数
    _pkNum = g.m.teamtaskfun.getFightNum(uid)
    if _pkNum <= 0:
        # 无挑战次数
        _res['s'] = -4
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-4')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _fbid = str(_fubenData['v'])
    _con = g.GC['gonghui_teamtask']['base']
    _fbCon = _con['boss'][_fbid]
    _fightId = str(_fbCon['fightid'])
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_fightId)

    # 设置挑战次数
    g.setPlayAttrDataNum(uid, 'teamtask_usenum')
    # 战斗开始
    f = ZBFight('pve')
    f.initFightByData(_userFightData + _bossFightData['herolist'])
    if 'pos2hp' in _fubenData:
        f.setRoleHp(1, _fubenData['pos2hp'])

    _fightRes = f.start()
    _winside = _fightRes['winside']
    if _winside == -2: _winside = 1
    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
    _resData = {}
    _resData['fightres'] = _fightRes
    # 战斗奖励
    _prize = list(_con['fubenprize']['fightprize'])
    _resData['prize'] = _prize
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'teamtask_fight', 'fbid': _fbid,'ghid':_ghid})
    g.sendChangeInfo(conn, _sendData)
    # 设置副本信息
    _setData = {}
    _setData['$inc'] = {g.C.STR('uid2dps.{1}', uid): _fightRes['dpsbyside'][0]}
    _setData['pos2hp'] = {}
    _setData['maxhp'] = 0
    for k, role in _fightRes['fightres'].items():
        if role['side'] == 0:
            continue
        _tmpHp = role['hp']
        if _tmpHp < 0: _tmpHp = 0
        _setData['pos2hp'][str(role['pos'])] = _tmpHp
        _setData['maxhp'] += role['maxhp']

    if _winside == 0:
        # 如果几人同时打 设置uid缓存 发邮件时如果uid还是自己 就可以发   不是说明正在被别人挑战
        g.mc.set(g.C.STR('teamtask_{1}_{2}', _ghid, _fbid), uid, 1)

        # 战斗胜利
        _setData['ispass'] = 1
        _sendData['killuid'] = uid
    g.m.teamtaskfun.setFuBenData(_ghid, _fbid, _setData)
    if 'ispass' in _setData:
        # 公会结算事件
        g.event.emit('teamtask_fubenoverchk', _ghid, _fbid, uid)

    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    # print g.debugConn.uid
    _data = [{"1":"5c29c0b6c0911a34646badf9","3":"5c29c0b6c0911a34646bae00"}]
    print doproc(g.debugConn, data=_data)