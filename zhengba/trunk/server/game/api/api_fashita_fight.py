#!/usr/bin/python
# coding:utf-8
'''
法师塔 - 开打
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("game")

import g
from ZBFight import ZBFight
def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int, 战斗阵容:dict]
    :return:
    ::

        {'d':{'prize': [],
            'fightres':{},
            'israndom':是否跳过战斗}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 关卡数
    _layernum = int(data[0])
    # 英雄的站位信息
    _fightData = data[1]
    _fashitaInfo = g.m.fashitafun.getFashitaInfo(uid)
    _passLayerNum, _prizeList = 0, []
    if _fashitaInfo:
        _passLayerNum = _fashitaInfo.get('layernum',0)
        _prizeList = _fashitaInfo.get('prizelist',[])

    # 参数有误
    if _layernum != _passLayerNum + 1 or _layernum > g.GC['fashitacom']['maxlayer']:
        _res['s'] = -101
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 不可重复挑战
    if _layernum == _passLayerNum or _layernum in _prizeList:
        _res['s'] = -2
        _res['errmsg'] = g.L('fashita_fight_res_-2')
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _fashitaCon = g.m.fashitafun.getFashitaCon(_layernum)
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_fashitaCon['boss'])
    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    # 如果胜利了
    if _winside == 0:
        _nt = g.C.NOW()
        _w = {'uid': uid}

        # 存入录像
        _zhanli = _chkFightData['zhanli']
        g.m.fashitafun.addRecording(uid, _layernum, _fightRes, _zhanli)

        # 跑马灯
        _notice = g.GC['fashitacom']['notice']
        if _layernum in _notice:
            gud = g.getGud(uid)
            g.m.chatfun.sendPMD(uid, 'fashitalevel', *[gud['name'], _layernum])
        # 获取剩余血量百分比 是否跳过战斗
        _resData['israndom'] = g.m.fightfun.isJumpOver(_fightRes['fightres'])
        # 开服狂欢
        g.event.emit('kfkh',uid,13,2,_layernum)
        # 神器任务
        g.event.emit('artifact', uid, 'fashita',val=_layernum,isinc=0)

        _prize = list(_fashitaCon['prize'])
        _passPrize = []
        # 直接发放阶段奖励
        if _layernum % 10 == 0 and _layernum not in _prizeList:
            _passPrize = list(g.GC['fashitacom']['passprize'][_layernum//10 - 1][1])
            _prizeList.append(_layernum)

        _data = {'prizelist':_prizeList,'layernum':_layernum,'lasttime':_nt}
        g.mdb.update('fashita',_w,_data,upsert=True)

        _sendData = g.getPrizeRes(uid, _prize + _passPrize, {'act':'fashita_fight'})
        g.sendChangeInfo(conn, _sendData)

        _resData['prize'] = _prize

        # 礼包监听
        g.event.emit('GIFT_PACKAGE', uid, 'zhanjianglibao', _layernum)

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("design6666")
    g.debugConn.uid = uid
    data = [42,{"1":"5d3976e59dc6d624cc3e2777"}]
    print doproc(g.debugConn,data)