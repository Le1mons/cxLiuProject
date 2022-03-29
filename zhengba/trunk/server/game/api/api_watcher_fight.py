#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 战斗
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):
    """

    :param conn:
    :param data: [第几个英雄:int]
    :return:
    ::

        {'d': {
            'fightres':{},
            'winprize':{'key': (trader宝物商人,supply补给品,mixture合剂,box宝箱奖励,flop翻牌奖励), 'prize':最终奖励}
            'data':守望者数据 参考open界面
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
    # 第几个英雄打
    _idx = int(data[0])
    # 等级不足
    # if not g.chkOpenCond(uid, 'watcher'):
    #     _res['s'] = -1
    #     _res['errmsg'] = g.L('global_limitlv')
    #     return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id'])
    # 数据不存在
    if not _data:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 全部通关
    if str(_data['layer']) not in g.GC['watcher']:
        _res['s'] = -6
        _res['errmsg'] = g.L('watcher_fight_-6')
        return _res

    _preStatus = _data.get('status',{})
    # 英雄全阵亡
    if g.m.watcherfun.getDeadHeroNum(_preStatus) == len(_data['herolist']):
        _res['s'] = -4
        _res['errmsg'] = g.L('watcher_fight_-4')
        return _res

    # 英雄选择错误
    if _idx < 0 or _idx >= len(_data['herolist']):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 血量小于0 已经阵亡了
    if str(_idx) in _preStatus and 'hp' in _preStatus[str(_idx)] and _preStatus[str(_idx)]['hp'] <= 0:
        _res['s'] = -5
        _res['errmsg'] = g.L('watcher_fight_-5')
        return _res

    _fightData = _data['herolist'][_idx]
    # _userFightData = g.m.fightfun.getUserFightData(uid, _fightData, 0)
    _npcData = _data['npc']
    f = ZBFight('pve')
    f.initFightByData(_fightData + g.C.dcopy(_npcData['herolist']))
    # 根据阵容获取上一次保存的状态 然后继承
    if str(_idx) in _preStatus:
        # 如果特定英雄的状态信息存在
        if 'nuqi' in _preStatus[str(_idx)]:
            _myNuqiLess = {}
            _myNuqiLess[str(_fightData[0]['pos'])] = _preStatus[str(_idx)].get('nuqi',50)
            f.setRoleNuqi(0, _myNuqiLess)
        if 'hp' in _preStatus[str(_idx)]:
            _myHpLess = {}
            _myHpLess[str(_fightData[0]['pos'])] = _preStatus[str(_idx)]['hp']
            f.setRoleHp(0, _myHpLess)

    # 继承对面的血量
    if 'fightless' in _npcData:
        f.setRoleHp(1, {'4': _npcData['fightless']['hp']})
        f.setRoleNuqi(1, {'4':_npcData['fightless']['nuqi']})

    _fightRes = f.start()
    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _fightData)
    _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _npcData['headdata']]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    # 如果胜利了
    _setData = {}
    if _winside == 0:
        _data['layer'] += 1
        _setData['winnum'] = _data['winnum'] = 1 + _data['winnum']
        # 更新历史最大层数
        if _data['toplayer'] < _data['layer']:
            _setData['toplayer'] = _data['toplayer'] = _data['layer']
        _setData['layer'] = _data['layer']

        # 最后一层就通关
        if str(_data['layer']) in g.GC['watcher']:
            _boss = g.m.fightfun.getNpcFightData(g.GC['watcher'][str(_data['layer'])]['npc'])
            _boss['herolist'][0].update({'enlargepro': 1.5})
            _setData['npc'] = _data['npc'] = _boss

        # 获取一个随机奖励
        _prizeDict = g.m.watcherfun.getWinPrize(_data.get('mixture',{}))
        _set = g.m.watcherfun.getFightPrize(uid,_data, _prizeDict)
        _setData.update(_set)

        _resData['winprize'] = _prizeDict
    # 战斗失败
    else:
        # 记录对手的残余状态
        for k, v in _fightRes['fightres'].items():
            for i in _npcData['herolist']:
                # 对方角色
                if v['side'] == 1 and 'pos' in v and 'pos' in i and v['pos'] == i['pos']:
                    _fightLess = {'hp': v['hp'], 'maxhp': v['maxhp'],'nuqi':v['nuqi']}
                    _data['npc']['fightless'] = _fightLess
                    _setData['npc'] = _data['npc']
        # 记录自己的残余状态
    _status = {}
    for k, v in _fightRes['fightres'].items():
        # 己方角色
        if v['side'] == 0 and 'hid' in v:
            _status[str(_idx)] = {'hp': v['hp'] if v['hp'] > 0 else 0, 'nuqi': v['nuqi'], 'maxhp': v['maxhp']}

    _preStatus.update(_status)
    _setData['status'] = _data['status'] = _preStatus
    g.mdb.update('watcher', {'uid': uid}, _setData)
    _resData['data'] = _data
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid('lk2')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [0])