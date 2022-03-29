# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
十字军远征 ——— 战斗
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn:
    :param data: [阵容:dict, 挑战的关卡数]
    :return:
    ::

        {'d': {'fightres':{}, 'prize':[战斗获胜的奖励], 'flop':{'prize':[翻牌获得的奖励],'show':[显示的奖励]}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 站位信息
    _fightData = data[0]
    # 挑战关卡数
    _idx = int(data[1])
    _data = g.getAttrByDate(uid,{'ctype':'shizijun_data'})
    if not _data:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _tidList = []
    for i in _fightData:
        if i == 'sqid' or i == 'pet':
            continue
        _tidList.append(_fightData[i])
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': map(g.mdb.toObjectId, _tidList)}})
    _lvList = [i for i in _heroList if i['lv'] >= 40]
    # 等级不足
    if len(_tidList) != len(_lvList):
        _res['s'] = -2
        _res['errmsg'] = g.L('shizijun_fight_res_-2')
        return _res

    _passList = _data[0].get('passlist')
    # 已挑战
    if _idx in _passList:
        _res['s'] = -1
        _res['errmsg'] = g.L('shizijun_fight_res_-1')
        return _res

    # 防守阵容不存在
    if str(_idx) not in _data[0]['v']:
        _res['s'] = -3
        #_res['errmsg'] = g.L('shizijun_fight_res_-3')
        return _res

    # 对手的阵容信息
    _rivalFightData = _data[0]['v'][str(_idx)]
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res
    f = ZBFight('pvp')

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # 对手战斗信息
    _RivalHero = [i for i in _rivalFightData['rival'] if 'sqid' in i or 'pid' in i or i['hp'] > 0]
    f.initFightByData(_userFightData + _RivalHero)
    # 继承血量
    if 'fightless' in _data[0]:
        _enemyLess = _data[0]['fightless'].get(str(_idx), {})
        f.setSZJRoleHp(1, _enemyLess)
    # 根据阵容获取上一次保存的状态 然后继承
    _heroStatus = _data[0].get('status', {})
    if _heroStatus:
        _myHpLess = {}
        _myNuqiLess = {}
        for i in xrange(len(_chkFightData['herolist'])):
            if 'pid' in _chkFightData['herolist'][i]:
                continue
            _tid = str(_chkFightData['herolist'][i]['_id'])
            # 如果特定英雄的状态信息存在
            if _tid in _heroStatus:
                _myNuqiLess[str(_chkFightData['herolist'][i]['pos'])] = _heroStatus[_tid].get('nuqi',50)
                _myHpLess[str(_chkFightData['herolist'][i]['pos'])] = _heroStatus[_tid]['hp']
        f.setRoleNuqi(0, _myNuqiLess)
        f.setSZJRoleHp(0, _myHpLess)

    _fightRes = f.start()
    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _rivalFightData['headdata']]
    _winside = _fightRes['winside']
    _resData = {'fightres': _fightRes}
    _con = g.GC['shizijun']['base']
    _setData = {}
    if _winside == 0:
        # 获取通关奖励
        _prize = _con['passprize'][_data[0].get('diff', '1')][str(_idx)]
        _sendData = g.getPrizeRes(uid, _prize, act={'act':'shizijun_fight','idx':_idx})
        g.sendChangeInfo(conn, _sendData)
        _resData.update({'prize': _prize})

        _passList.append(_idx)
        _setData['passlist'] = _passList
        # 刷新下一关的boss数据
        if _idx + 1 < g.GC['shizijun']['base']['rivalnum']:
            _raval = g.m.shizijunfun.getRivalList(uid, _idx + 1, _data[0].get('black',[uid]))
            _setData['v'] = {str(_idx + 1): _raval[str(_idx + 1)]}
            _data[0]['v'][str(_idx)]['rival'] = [{'hid': x['hid'],'dengjielv':x['dengjielv'],'lv':x['lv']} for x in _data[0]['v'][str(_idx)]['rival'] if 'hid' in x]
            _setData['v'].update(_data[0]['v'])
            _setData['black'] = _raval['black']
        else:
            g.setAttr(uid, {'ctype':"shizijun_difficult"}, {"$addToSet":{'v': _data[0].get('diff','1')}})

        # 开服狂欢活动
        g.event.emit('kfkh',uid,19,5,len(_passList))
        # 十字军活动
        if g.m.huodongfun.chkZCHDopen('shizijun'):
            g.m.huodongfun.setZCHDval(uid,'shizijun')
        # 神器任务
        g.event.emit('artifact', uid, 'yuanzheng',val=_idx+1,isinc=0)
        # 日常任务监听
        g.event.emit('dailytask', uid, 14)
        # 监听十字军试炼成就
        g.event.emit("Shilian", uid, val=len(_passList))
        g.event.emit("Shilianwin", uid)

        # 节日狂欢
        g.event.emit('jierikuanghuan', uid, '2', _idx+1, False)

        # 获取翻牌奖励
        _dlzId = _con['diaoluozu']
        _resPrize = {'prize': [], 'show': []}
        for i in xrange(3):
            _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
            if i == 0:
                _resPrize['prize'] += _prize
                _sendData = g.getPrizeRes(uid, _prize, act={'act': 'shizijun_fight', 'idx': _idx})
                g.sendChangeInfo(conn, _sendData)
            else:
                _resPrize['show'] += _prize
        _resData.update({'flop': _resPrize})
    else:
        # 记录对手的残余状态
        _fightLess = {}
        for k, v in _fightRes['fightres'].items():
            for i in _rivalFightData['rival']:
                # 己方角色
                if v['side'] == 1 and 'hid' in v and 'hid' in i and v['pos'] == i['pos']:
                    _fightLess[str(i['pos'])] = int(v['hp'] * 100.0 / v['maxhp'])  # v['hp']  修改为按百分比继承，而不是绝对值

                    # 如果pos是7 并且 大于0
                    if k in _fightRes['roles'] and _fightRes['roles'][k]['pos'] == 7 and _fightRes['fightres'][k]['pos'] != 7:
                        _fightLess['yj'] = v['pos']

        g.setAttr(uid, {'ctype': 'shizijun_data'}, {'fightless': {str(_idx): _fightLess}})

    # 记录自己的残余状态
    _status = {}
    for k, v in _fightRes['fightres'].items():
        # 己方角色
        if v['side'] == 0 and 'hid' in v:
            # 如果pos是7 并且 大于0
            if k in _fightRes['roles'] and _fightRes['roles'][k]['pos'] == 7 and _fightRes['fightres'][k]['pos'] != 7:
                _pos = 7
            elif k in _fightRes['roles'] and _fightRes['roles'][k]['pos'] != 7 and _fightRes['fightres'][k]['pos'] == 7:
                _pos = _fightRes['roles'][k]['pos']
            else:
                _pos = v['pos']
            _tid = _fightData[str(_pos)]
            # _status[_tid] = {'percent': int(v['hp']*100.0/v['maxhp']),'nuqi':v['nuqi'],'maxhp':v['maxhp'],'hp':v['hp']}  
            # 修改为按百分比继承，而不是绝对值
            
            _status[_tid] = {'hp': int(v['hp']*100.0/v['maxhp']),'nuqi':v['nuqi'] if v['nuqi'] > 50 else 50,'maxhp':v['maxhp']}
    _heroStatus.update(_status)
    _setData['status'] = _heroStatus
    g.setAttr(uid, {'ctype': 'shizijun_data'}, _setData)

    # g.m.taskfun.chkTaskHDisSend(uid)
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = uid
    data = [{"1":"5e89e76c9dc6d64d2395cbe4","7":"5e89e76c9dc6d64d2395cb65"},2]
    a = doproc(g.debugConn, data)
    print a
