#!/usr/bin/python
# coding: utf-8
'''
探险——挑战boss通关
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")


import g
from ZBFight import ZBFight


def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _lv = gud['lv']
    _mapCon = g.m.tanxianfun.getMapCon(gud['maxmapid'])
    if _mapCon['needlv'] > _lv:
        #等级未满足
        _res['s'] = -3
        _res['errmsg'] = g.L('tanxian_fightboss_-3')
        return _res

    # 最后一关bos可以打
    if gud['maxmapid'] > g.GC['tanxiancom']['base']['maxmapid']:
        #已到最大通关地图
        _res['s'] = -2
        _res['errmsg'] = g.L('tanxian_fightboss_-2')
        return _res
    
    #战斗参数
    _fightData = data[0]
    _chkFightData = g.m.fightfun.chkFightData(uid,_fightData)
    if  _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res
    
    #玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid,_chkFightData['herolist'],0, sqid=_fightData.get('sqid'))
    #boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_mapCon['boss'])
    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    _winside = _fightRes['winside']
    _fightRes['headdata'] = [_chkFightData['headdata'],_bossFightData['headdata']]
    _resData = {}
    _resData['fightres'] = _fightRes
    if _winside == 0:
        #战斗胜利
        _nextMapid = gud['maxmapid'] + 1
        if _nextMapid > g.GC['tanxiancom']['base']['maxmapid']:
            _nextMapid = gud['maxmapid']
        #通关奖励
        _prize = list(_mapCon['passprize'])
        _resData['prize'] = _prize
        # 获取剩余血量百分比
        _resData['israndom'] = g.m.fightfun.isJumpOver(_fightRes['fightres'])
        _tmpPrize = _prize + [{'a':'attr','t':'maxmapid','n':_nextMapid}]
        _sendData = g.getPrizeRes(uid, _tmpPrize, {'act':'tanxian_fightboss','maxmapid':_nextMapid})
        g.sendChangeInfo(conn, _sendData)
        #设置最新通关时间
        g.mdb.update('userinfo',{'uid':uid},{'lastpassmaptime':g.C.NOW()})
        # 开服狂欢活动
        g.event.emit('kfkh',uid,11,1,gud['maxmapid'],isinc=0)
        # 神器任务
        g.event.emit('artifact', uid, 'maxmap', val=_nextMapid - 1,isinc=0)
        # 英雄招募
        if _nextMapid > 50:
            g.event.emit('hero_recruit', uid, '1')

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq12")
    g.debugConn.uid = uid
    _data = [{"1":"5b542346e1382369ec0f5e91","2":"5b5c57a6ad23ab1d300fb43a","3":"5b5c5474ad23ab1d300fb33f","4":"5b5c09caad23ab2a74c94495","5":"5b547b0ac0911a20ecc7cefa","6":"5b4c304fe138233acd4f14c4"}]
    print doproc(g.debugConn, data=_data)
'''{u'1': u'5b1b4a01c0911a36ccec250f', u'3': u'5b1b4a01c0911a36ccec2515', u'2': u'5b1b4a01c0911a36ccec2514', u'5': u'5b1b4a01c0911a36ccec2517', u'4': u'5b1b4a01c0911a36ccec2516', u'6': u'5b1b4a01c0911a36ccec2510'}'''