#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 下棋
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):
    """

    :param conn:
    :param data: [要走的索引:int, 哪一关:str, ('2','3','4','6','9','8')这几个事件需要三个参数(索引或者阵容),神秘商人需要4个参数(是否放弃购买)]
    :return:
    ::

        {'d':{
            'maze':{
                step: 层数
                maze:{1:[迷宫关卡1的事件id]},
            'hero':[{lv:等级,hid:英雄id,'tid':英雄tid,'star':英雄星级}]}
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
    # 要走的索引
    _idx = int(data[0])
    # 哪一行
    _step = str(data[1])

    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _maze = g.mdb.find1('maze', {'uid': uid}, fields={'_id':0,'uid':0,'ctime':0})
    # 数据已存在
    if not _maze:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 当前还有遗物未领取
    if 'relicprize' in _maze:
        _res['s'] = -10
        _res['errmsg'] = g.L('maze_chess_-10')
        return _res

    # 已经选择过的路径
    _trace = _maze['trace']
    # 这一层已经做出了选择 或者已经打完了
    if (_step in _trace and _trace[_step]['finish']) or not _trace[str(int(_step)-1)]['finish']:
        _res['s'] = -8
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['mazecom']['base']
    # 索引越界
    if _maze['trace'].get(_step,{}).get('finish') and (_idx >= len(_maze['maze'][str(len(_trace)+1)]) or int(_step) >= _con['level']):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 已经打完了
    # if len(_trace) >= len(_maze['maze']):
    #     _res['s'] = -4
    #     _res['errmsg'] = g.L('maze_chess_-4')
    #     return _res

    _trace[_step] = {'idx': _idx}

    # 只能选择靠近的
    if not g.m.mazefun.chkCanChess(_step, _idx, _trace[str(int(_step)-1)]['idx']):
        _res['s'] = -6
        _res['errmsg'] = g.L('maze_chess_-6')
        return _res

    _data = _maze['maze'][_step][_idx]
    _event = _data['event']
    # 参数太少
    if _event in ('2','3','4','6','9','8') and len(data) < 3:
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 战斗 先提取战斗信息
    if _event in ('2','3','4','9'):
        _fightData = data[2]
        # 玩家战斗信息
        # _userFightData = g.mdb.find('mazehero',{'uid':uid,'tid':{'$in': _fightData.values()}},fields={'_id':0,'uid':0})
        _userFightData = g.m.mazefun.getMazeHeroFightdata(uid, _fightData.values(), _maze.get('growbuff',{}), _fightData.get('sqid'))
        # if len(_fightData) != len(_userFightData):
        #     _res['s'] = -7
        #     _res['errmsg'] = g.L('global_argserr')
        #     return _res

        for i in _userFightData:
            if 'sqid' in i or 'pid' in i:
                continue

            _skills = g.m.mazefun.getSkills(i['hid'], _maze.get('relic'))
            # 加上技能
            i['skill'] += _skills
            for pos in _fightData:
                if i['tid'] == _fightData[pos]:
                    i['pos'] = int(pos)

        _fighHeroList = g.m.mazefun.getFightHeroList(uid, _userFightData, _data, _maze.get('relic',{}))
        f = ZBFight('pve')
        f.initFightByData(_fighHeroList)
        # 根据阵容获取上一次保存的状态 然后继承
        _heroStatus = _maze.get('status', {})
        if _heroStatus:
            _myHpLess = {}
            _myNuqiLess = {}
            for i in _userFightData:
                if 'hid' not in i:
                    continue
                # 如果特定英雄的状态信息存在
                if i['tid'] in _maze['status']:
                    _myNuqiLess[str(i['pos'])] = _heroStatus[i['tid']].get('nuqi', 50)
                    _myHpLess[str(i['pos'])] = _heroStatus[i['tid']]['hp']
            f.setRoleNuqi(0, _myNuqiLess, 'maze')
            f.setSZJRoleHp(0, _myHpLess)



    _finish = 1

    _setData = {'$set': {'lasttime':g.C.NOW()}}
    # 挑战boss类
    if _event in ('2', '3', '4'):
        # 继承血量
        if 'fightless' in _maze:
            _enemyLess,_nuqiLess = {}, {}
            for pos,ele in _maze['fightless'].items():
                _enemyLess[pos] = ele['hp']
                _nuqiLess[pos] = ele['nuqi']
            f.setSZJRoleHp(1, _enemyLess)
            f.setRoleNuqi(1, _nuqiLess, 'maze')

        _fightRes = f.start()

        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

        _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _data['headdata']]
        _winside = _fightRes['winside']
        _resData = {'fightres': _fightRes}
        # 胜利
        if _winside == 0:
            _prize = _data['prize']
            _sendData = g.getPrizeRes(uid, _prize, act={'act': 'maze_chess','event':_event,'step':_step})
            g.sendChangeInfo(conn, _sendData)
            _resData['prize'] = _prize
            if 'reliccolor' in _data:
                # 随机三个遗物让他选
                _setData['$set']['relicprize'] = g.m.mazefun.getWinRelic(_data['reliccolor'],_maze.get('relic',{}))
            _setData['$unset'] = {'fightless': 1}

            # 增加征讨令经验
            _ztCon = g.GC['zhengtao']['base']['maze'][str(_maze['step'])][_maze['diff']]
            if _event in _ztCon:
                g.mdb.update('zhengtao',{'uid':uid},{'$inc':{'exp':_ztCon[_event]}})

        else:
            _finish = 0
            # 记录对手的残余状态
            _fightLess = {}
            for k, v in _fightRes['fightres'].items():
                # 己方角色
                if v['side'] == 1 and 'hid' in v:
                    _fightLess[str(v['pos'])] = {'hp':int(v['hp'] * 100.0 / v['maxhp']),'nuqi':v['nuqi']}
            _setData['$set']['fightless'] = _fightLess

        # 记录自己的残余状态
        _status = g.m.mazefun.setHeroStatus(_fightRes, _fightData)

        _heroStatus.update(_status)
        _setData['$set']['status'] = _heroStatus
        _res['d'] = _resData
    # 灵魂囚笼
    elif _event == '6':
        # 要解放得英雄索引
        _saveIdx = data[2]
        if _saveIdx >= len(_data['hero']):
            _res['s'] = -12
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _hero = _data['hero'][_saveIdx]

        if _maze.get('relic'):
            _buff = g.m.mazefun.getBaseBuffPro(_maze['relic'], _hero['job'], _maze['step'], _maze['diff'])
            _hero['relicbuff'] = _buff
        # 添加英雄
        g.mdb.insert('mazehero', _hero)
        # 删除缓存
        g.mc.delete('maze_tidlist_{}'.format(uid))

    # 前线营地
    elif _event == '5':
        _setData['$set']['status'] = _maze.get('status',{})
        for tid in _maze.get('status',{}):
            if _setData['$set']['status'][tid]['hp'] <= 0:
                continue
            _setData['$set']['status'][tid]['hp'] += 50
            if _setData['$set']['status'][tid]['hp'] > 100:
                _setData['$set']['status'][tid]['hp'] = 100

        # 如果有特殊遗物
        if '91' in _maze['relic']:
            for i in g.m.mazefun.getUserTidList(uid):
                if i in _setData['$set']['status']:
                    if _setData['$set']['status'][i]['hp'] <= 0:
                        continue
                    _setData['$set']['status'][i]['nuqi'] += 50
                    _setData['$set']['status'][i]['hp'] += 50
                    if _setData['$set']['status'][i]['hp'] > 100:
                        _setData['$set']['status'][i]['hp'] = 100
                else:
                    _setData['$set']['status'][i] = {'hp':100, 'nuqi':100}

    # 神秘商人
    elif _event == '8':
        _finish = int(data[2])
        # 不结束这个  就是直接前往
        if not _finish and len(data) >= 4:
            _buyIdx = int(data[3])
            if _buyIdx >= len(_data['goods']):
                _res['s'] = -11
                _res['errmsg'] = g.L('global_argserr')
                return _res

            _itemInfo = _data['goods'][_buyIdx]
            _need = _itemInfo['need']
            for i in _need:
                i['n'] *= _itemInfo['sale'] * 0.1
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

            _prize = [_itemInfo['item']]

            _setData['$inc'] = {'maze.{0}.{1}.goods.{2}.buynum'.format(_step, _idx,_buyIdx): -1}

            _sendData = g.delNeed(uid, _need, 0, logdata={'act': 'maze_chess', 'type': _idx})
            _send = g.getPrizeRes(uid, _prize, {'act': 'maze_chess'})
            g.mergeDict(_send, _sendData)
            g.sendChangeInfo(conn, _send)
            _res['d'] = {'prize': _prize}

    # 贪婪洞窟
    elif _event == '9':
        _fightRes = f.start()

        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

        _fightRes['headdata'] = [g.m.userfun.getShowHead(uid), _con['bosslist'][_data['boss']]['headdata']]
        _winside = _fightRes['winside']
        _resData = {'fightres': _fightRes}
        _WinOrLose = 0
        if _winside == 0:
            _WinOrLose = 1
            _prize = g.m.diaoluofun.getGroupPrize(_data['dlz'])
            _resData['prize'] = _prize
            _send = g.getPrizeRes(uid, _prize, {'act':"maze_chess",'event':_event})
            g.sendChangeInfo(conn, _send)

        # 记录自己的残余状态
        _status = g.m.mazefun.setHeroStatus(_fightRes,_fightData)
        _heroStatus.update(_status)
        _setData['$set']['status'] = _heroStatus
        _setData['$set']['WinOrLose'] = _WinOrLose
        _res['d'] = _resData

    # 灵魂医者
    else:
        if 'status' in _maze:
            _luckyTid = min(_maze['status'].keys(), key=lambda x:_maze['status'][x]['hp'])
        else:
            _luckyTid = g.C.RANDLIST(g.m.mazefun.getUserTidList(uid))

        _setData['$set']['status.{}'.format(_luckyTid)] = {'hp': 100,'nuqi':100}
        _res['d'] = {'tid': _luckyTid}

    _trace[_step]['finish'] = _finish
    _setData['$set']['trace'] = _trace

    # 这一层打同了
    if _finish and int(_step) == _con['level']:
        _total = _maze.get('total', {})
        _setData['$set']['total.{}'.format(str(_maze['step']))] = _total.get(str(_maze['step']), 0) + 1

    # 战斗胜利后要增加特殊的遗物属性
    if _event in ('2','3','4','9') and _winside == 0 and 'relic' in _maze and set(_maze['relic'].keys()) & set(str(i) for i in xrange(13,19)):
        _con = g.GC['mazerelic']
        _buff = _maze.get('growbuff', {})
        for rid in ('13', '14', '15', '16', '17', '18'):
            if rid not in _maze['relic']:
                continue
            _buff[rid] = _buff.get(rid, {})
            for key, val in _con[rid]['buff'].items():
                _buff[rid][key] = _buff[rid].get(key, 0) + val * _maze['relic'][rid]
                if _buff[rid][key] > _con[rid]['cond']['maxpro'] * _maze['relic'][rid]:
                    _buff[rid][key] = _con[rid]['cond']['maxpro'] * _maze['relic'][rid]

        if _buff:
            _setData['$set']['growbuff'] = _buff

    g.mdb.update('maze',{'uid':uid},_setData)

    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.mc.flush_all()
    g.debugConn.uid = uid
    print doproc(g.debugConn,[1,"8",{"1":"5e9025bb9dc6d67cf8308c04","7":"5ebd0d8e46a0538723063dee"}])