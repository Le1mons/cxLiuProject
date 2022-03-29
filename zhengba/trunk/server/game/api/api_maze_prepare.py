#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 开启挑战
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
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
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _maze = g.mdb.find1('maze', {'uid': uid}, fields={'_id': 0, 'uid': 0, 'ctime': 0})
    # 数据已存在
    if _maze and g.C.NOW() <= _maze['cd']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _maze = None
    if g.config['OWNER'] not in ('niuke', 'wwceshi', 'dev'):
        _maze = g.mdb.find1('maze', {'uid': uid},fields={'maze':0,'_id':0,'uid':0})
        # 数据已存在
        if _maze and g.C.NOW() < _maze['cd']:
            _res['s'] = -10
            _res['errmsg'] = g.L('global_argserr')
            return _res

    _lvGt100Heros = g.m.herofun.getMyHeroList(uid, where={'lv': {'$gt': g.GC['mazecom']['base']['herolv']}}, sort=[['zhanli', -1]])
    if not _lvGt100Heros:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _heroData, _tidList = g.m.mazefun.getPrepareHeroData(uid, _lvGt100Heros)
    # 获取玩家前10英雄的平均等级
    _lvGt10Heros = _lvGt100Heros[:6]
    _avgLv = 70
    if _lvGt10Heros:
        _avgLv = sum([i["lv"] for i in _lvGt10Heros]) / 6

    g.mdb.delete('mazehero', {'uid': uid})
    # 设置tid缓存
    g.mc.set('maze_tidlist_{}'.format(uid), _tidList)
    g.mdb.insert('mazehero', _heroData)

    _mazeData = g.m.mazefun.getMazeData(uid, '1', '1', [uid])
    _data = {
        '$set':{
            'ctime':g.C.NOW(),
            'trace': {'1': {'idx':0,'finish':1}},
            'maze':_mazeData,
            'step':1, # 第一关
            'diff': "1", # 难度
            "cd":g.m.mazefun.getResetTime()
        },
        "$unset":{i: 1 for i in ('status','fightless','relic','growbuff','relicprize','dajixue','WinOrLose','receive')}
    }
    g.mdb.update('maze',{'uid': uid},_data,upsert=True)

    # 删除扫荡数据
    g.delAttr(uid, {"ctype":"maze_saodang"})


    # 记录数据
    if _maze:
        _gud = g.getGud(uid)
        _setData = {'lv':_gud['lv'],'vip':_gud.get('vip',0),'over':_maze.get('receive')==1,'diff':_maze['diff'],'step':_maze['step'],
                    'level':len(_maze['trace']) if _maze['trace'][str(len(_maze['trace']))]['finish'] else len(_maze['trace']) - 1,'fuhuo':_maze.get('dajixue',0),
                    'WinOrLose':_maze.get('WinOrLose',-1),'date':g.C.DATE(_maze.get('lasttime',_maze['ctime']))}

        g.m.dball.writeLog(uid, 'maze_tongji', _setData)
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('0')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])