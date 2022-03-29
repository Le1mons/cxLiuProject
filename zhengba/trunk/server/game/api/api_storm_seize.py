#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 占领
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g
from ZBFight import ZBFight



def proc(conn, data):
    """

    :param conn:
    :param data: [要占领的区域:str, 要塞的索引:int, 阵容:dict]
    :return:
    ::

        {"d":{'fightres':{}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 要占领的区
    _area = str(data[0])
    # 要占领第几号
    _number = abs(int(data[1]))
    # 阵容
    _fightData = data[2]
    _con = g.GC['storm']['base']

    # 传过来的参数有误
    if _area not in _con['region'] or _number > len(_con['region'][_area]):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 锁
    if _area != str(_con['special']):
        if g.mc.get('storm_fortress_{0}_{1}'.format(_area, _number)):
            _res['s'] = -20
            _res['errmsg'] = g.L('storm_seize_-20')
            return _res
        g.mc.set('storm_fortress_{0}_{1}'.format(_area, _number), 1, 1)

    _num = g.m.stormfun.getEnergeNum(uid)
    # 次数不足
    if _num <= 0:
        _res['s'] = -3
        _res['errmsg'] = g.L('storm_seize_-3')
        return _res

    _need = _con['fightneed']['item']
    if _need:
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

    # 不能上阵已防守的队伍
    _teams = g.mdb.find('storm',{'uid':uid,'etime':{'$gt':g.C.NOW()},'stime':{'$lt':g.C.NOW()},'over':{'$exists':0}},fields=['_id','fightdata','area','etime']) or []
    _tidSet = set()
    for i in _fightData:
        if i not in ('sqid', 'pet'):
            _tidSet.add(_fightData[i])

    for temp in _teams:
        # 特殊区域的要塞
        if _area == str(_con['special']) == temp['area'] and g.C.NOW() <= temp['etime']:
            _res['s'] = -7
            _res['errmsg'] = g.L('storm_seize_-7')
            return _res

        temp['fightdata'].pop('pet', None)
        if _tidSet & set(temp['fightdata'].values()):
            _res['s'] = -4
            _res['errmsg'] = g.L('storm_seize_-4')
            return _res

    # 等级或者vip不够上阵队伍数量的要求
    if len(_teams)+1 > 4 or not g.chkOpenCond(uid, 'storm_{}'.format(len(_teams)+1)):
        _res['s'] = -6
        _res['errmsg'] = g.L('storm_seize_-6')
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))

    _w = {'area':_area,'number':_number,'etime':{'$gte':g.C.NOW()},'over':{'$exists':0}}
    if _area == str(g.GC['storm']['base']['special']):
        _w['uid'] = uid
    _data = g.mdb.find1('storm',_w,fields={'lasttime':0})
    # 不能打自己的
    if _data and uid == _data['uid']:
        _res['s'] = -60
        _res['errmsg'] = g.L('storm_seize_-60')
        return _res

    # 如果这一层没有人了或者是特殊区域并且没有占领过
    if not _data:
        _chkEnemyData = g.m.fightfun.getNpcFightData(_con['fortress'][_con['region'][_area][_number]]['npc'])
        _rivalData = _chkEnemyData['herolist']
        f = ZBFight('pve')

    # 超过了保护时间
    elif g.C.NOW() > _data['stime'] + _con['protect']:
        # 对手的信息
        _rivalData = _data['team']
        for i in _rivalData:
            i['side'] = 1

        _chkEnemyData = {'headdata': g.m.userfun.getShowHead(_data['uid'])}
        f = ZBFight('pvp')
    else:
        _res['s'] = -5
        _res['errmsg'] = g.L('storm_seize_-5').format(_data['stime'] + _con['protect'] - g.C.NOW())
        return _res

    if _need:
        _s = g.delNeed(uid, _need, 0, {'act': 'storm_seize'})
        g.sendChangeInfo(conn, _s)

    _fightRes = f.initFightByData(_userFightData + _rivalData).start()
    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _chkEnemyData['headdata']]
    _winside = _fightRes['winside'] = _fightRes['winside'] if _fightRes['winside'] != -2 else 1
    _resData = {'fightres': _fightRes}
    _winUid = _data['uid'] if _data else ''
    if _winside == 0:
        _winUid = uid
        # 如果是抢占别人的 设置结束的时间
        if _data:
            g.mdb.update('storm', {'_id':_data['_id']},{'etime':g.C.NOW()})
            g.m.mymq.sendAPI(_data['uid'], 'storm_update', '1')

        # # team只取有用的信息
        for i in _userFightData:
            i['dead'] = False
            if not i.get('hid'):
                i['nuqi'] = 0
                continue
            i['nuqi'] = 50
            i['hp'] = i['maxhp']

        _fortressData = {'$set':{'stime':g.C.NOW(),'zhanli':_chkFightData['zhanli'],'fightdata':_fightData,
                         'team':_userFightData,'color':_con['region'][_area][_number],
                         'etime':g.C.NOW() + _con['timeprize'][_con['region'][_area][_number]][0]['holdsec']},
                         '$unset': {'over': 1,'buytime':1}}
        g.mdb.update('storm',{'uid':uid,'area':_area,'number':_number}, _fortressData,upsert=True)

    # 和真人对打 增加日志
    g.mdb.insert('stormlog',{'uid':uid, 'rival':_data['uid'] if _data else '', 'area':_area,'winside':_winside,'win_uid':_winUid,
                             'number':_number, 'ctime':g.C.NOW(),'ttltime':g.C.TTL(),'color':_con['region'][_area][_number]})

    g.m.stormfun.setEnergeNum(uid, -_con['fightneed']['energy'])

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('jingqi_1809032054531557')
    _where = {'uid':1,'touid':1}
    _data ={
        '$set':{'ttltime':1,'lasttime':1},
        '$push':{'data':{'$each':[1],'$slice':-20}},
    }
    _r = g.mdb.update('blacklist',_where,_data,upsert=True)