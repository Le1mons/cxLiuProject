#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g
from ZBFight import ZBFight

'''
公会 - 公会副本战斗
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        # 无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    _con = g.GC['gonghui_fuben']['base']
    # 副本id
    _fbid = str(data[0])
    _chkFBid = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    if _chkFBid not in _con['fuben']:
        # 公会副本已全部通关
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-2')
        return _res

    if _fbid != _chkFBid:
        # 当前副本不可挑战
        _res['s'] = -3
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-3')
        return _res

    # 当天挑战过boss的次数
    _pkNum = g.m.gonghuifun.getPkNum(uid)
    if _pkNum >= len(_con['pkneed']):
        # 无挑战次数
        _res['s'] = -4
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-4')
        return _res

    # 副本信息
    _fubenData = g.m.gonghuifun.getFuBenData(_ghid, _fbid)
    if 'ispass' in _fubenData:
        # 已经通关
        _res['s'] = -5
        _res['errmsg'] = g.L('gonghuifuben_fight_res_-5')
        return _res

    _need = list(_con['pkneed'][_pkNum])
    if _need[0]['n'] > 0:
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

    # 战斗参数
    _fightData = data[1]
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _fbCon = _con['fuben'][_fbid]
    _fightId = str(_fbCon['fightid'])
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_fightId)
    # 判断是否扣除
    if _need[0]['n'] > 0:
        # 扣除消耗
        _sendData = g.delNeed(uid, _need, 0, logdata={'act': 'gonghuifuben_fight', 'fbid': _fbid})
        g.sendChangeInfo(conn, _sendData)

    # 设置挑战次数
    g.m.gonghuifun.setPkNum(uid)
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
    _prizeCon = _con['fubenprize'][_fbCon['prizeid']]
    _prize = list(_prizeCon['fightprize'])
    _resData['prize'] = _prize
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'gonghuifuben_fight', 'fbid': _fbid,'ghid':_ghid})
    g.sendChangeInfo(conn, _sendData)
    # 设置副本信息
    _setData = {}
    _setData['v'] = g.C.NOW()
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
        g.mc.set(g.C.STR('ghfuben_{1}_{2}', _ghid, _fbid), uid, 1)

        # 战斗胜利
        _setData['ispass'] = 1
        _sendData['killuid'] = uid
    g.m.gonghuifun.setFuBenData(_ghid, _fbid, _setData)
    if 'ispass' in _setData:
        # 公会结算事件
        g.event.emit('gonghui_fubenoverchk', _ghid, _fbid, uid)

    # 日常任务监听
    # g.event.emit('dailytask', uid, 13)

    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = '0_5aec54eb625aee6374e25e0c'
    g.debugConn.uid = uid  # g.buid('tk1')
    # print g.debugConn.uid
    # _data = [1,{"1":"5b23ba48e1382331bb76648b","3":"5b208850c0911a1640075267"}]
    # print doproc(g.debugConn, data=_data)
    print g.m.fightfun.getNpcFightData('20059')