#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 难度选择
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [要选择的难度:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _diff = str(data[0])
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['mazecom']['base']
    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','step','diff','total','trace','receive','relic'])
    # 数据已存在
    if not _maze or len(_maze['trace']) != _con['level']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 奖励还没领
    if 'receive' not in _maze:
        _res['s'] = -3
        _res['errmsg'] = g.L('maze_difficult_-3')
        return _res

    _nextStep = str(_maze['step']+1)
    # 通关了
    if _nextStep not in _con['maze'] or _diff not in _con['maze'][_nextStep]:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _total = _maze.get('total',{})
    # 前置条件没有满足
    if _con['maze'][_nextStep][_diff]['cond'] and _total.get(_nextStep,0) < _con['maze'][_nextStep][_diff]['cond']['num']:
        _res['s'] = -5
        _res['errmsg'] = g.L('global_valerr')
        return _res

    # 如果有扫荡数据没有处理
    _saodanginfo = g.m.mazefun.getSaoDangInfo(uid)
    for list in _saodanginfo.values():
        if list:
            _res['s'] = -6
            _res['errmsg'] = g.L('maze_saodang_-2')
            return _res

    _mazeData = g.m.mazefun.getMazeData(uid, _nextStep, _diff, [uid])
    _data = {
        '$set':{
            'ctime':g.C.NOW(),
            'trace': {'1': {'idx':0,'finish':1}},
            'maze':_mazeData,
            'step':int(_nextStep), # 第一关
            'diff': _diff, # 难度
            'lasttime': g.C.NOW()
        },
        "$unset":{i: 1 for i in ('fightless','receive')}
    }
    g.mdb.update('maze',{'uid': uid},_data,upsert=True)

    # 如果有曙光之灯
    if _con['maze'][_nextStep][_diff]['cond'] and _total.get(_nextStep,0) >= _con['maze'][_nextStep][_diff]['cond']['num'] and set(['25','26','27']) & set(_maze.get('relic',[])):
        _set = {'$inc':{}}
        _relicCon = g.GC['mazerelic']
        for rid in ('25','26','27'):
            if rid not in _maze['relic']:
                continue
            for key,val in _relicCon[rid]['buff'].items():
                key = 'relicbuff.{}'.format(key)
                _set['$inc'][key] = _set['$inc'].get(key, 0) + val * _maze['relic'][rid]

        g.mdb.update('mazehero',{'uid': uid}, _set)
    return _res

if __name__ == '__main__':
    uid = g.buid('lyf')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [2])