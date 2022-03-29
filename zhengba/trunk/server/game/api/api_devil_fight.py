#!/usr/bin/python
# coding:utf-8
'''
神殿魔王 -  挑战魔王
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight



def proc(conn, data):
    """

    :param conn:
    :param data: [战斗阵容:dict]
    :return:
    ::

        {'d': {'fightres':{}
                'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 阵容
    _fightData = data[0]
    # 等级不足
    if not g.chkOpenCond(uid, 'temple_devil'):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['shendianmowang']['base']
    _nt = g.C.NOW()
    # 只能在规定时间内看到
    if not _con['time'][0] + g.C.ZERO(_nt) <= _nt <= _con['time'][1] + g.C.ZERO(_nt):
        _res['s'] = -1
        _res['errmsg'] = g.L('devil_open_-1')
        return _res

    # 挑战次数不足
    if g.m.devilfun.getFightNum(uid) <= 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('devil_fight_-2')
        return _res

        # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _bossData = g.m.devilfun.getBossData()
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    f = ZBFight('pve')
    _bossList = list(_con[_bossData['name']]['boss'])
    # 删除fakemodel  客户端假战斗模型字段
    if _bossData['name'] == 'mowang1':
        del _bossList[0]['fakemodel']

    # 增加技能
    for i in _bossList:
        i['skill'] = list(i['skill']) + [_bossData['job'], _bossData['zhongzu']]

    _fightRes = f.initFightByData(_userFightData + _bossList).start()
    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _bosHead = {'head':_con[_bossData['name']]['boss'][0]['heroico'], 'lv':_con[_bossData['name']]['boss'][0]['lv'],'name':_con[_bossData['name']]['boss'][0]['name']}
    _fightRes['headdata'] = [_chkFightData['headdata'], _bosHead]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    _prize = g.m.diaoluofun.getGroupPrize(_con['prize']['fight'])
    _sendData = g.getPrizeRes(uid, _prize, {'act':'devil_fight'})
    g.sendChangeInfo(conn, _sendData)
    _resData['prize'] = _prize

    g.m.devilfun.GATTR.setPlayAttrDataNum(uid, 'templedevil_usednum')
    # 添加战斗录像
    g.m.devilfun.addMaxDpsRecording(uid, _resData['fightres'])
    # 添加伤害
    g.m.devilfun.GATTR.setPlayAttrDataNum(uid, 'temple_devil_dps', _resData['fightres']['dpsbyside'][0])

    # 战旗登陆任务
    g.event.emit("FlagTask", uid, '103')
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '7')

    g.event.emit('yuanxiao3', uid, "2")
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = [{"1":"5f4a50949dc6d60da72d9ef0","2":"5f64d9999dc6d62152d285bd","3":"5f64da109dc6d62152d286b1","4":"5f633d01bbc6daf23faa5a08","5":"5f633cfdbbc6daf23faa591c","6":"5f633d02bbc6daf23faa5a5a"}]
    print doproc(g.debugConn, data=data)