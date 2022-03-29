#!/usr/bin/python
# coding:utf-8
'''
遗迹考古 - 领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,data,farthest,exp,energe,farthest".split(','))
    # 没有开始考古
    if not _myData["data"]:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _nt = g.C.NOW()
    # 走完的时间 秒
    _isdouble = _myData['data'].get("double", 0)
    _time = int(_con['map'][_myData['data']['mapid']]['distance'] / _myData['data']['speed'])
    # 如果启动了双倍
    if _isdouble:
        _time *= 2

    _break = False
    # 补给不够达到终点
    if g.C.CEIL(_time / 60.0) * _con['supply'] > _myData['data']['supply']:
        # 现在时间超过补给时间
        _supplyTime = _myData['data']['supply'] / _con['supply'] * 60
        if _isdouble:
            _supplyTime = _myData['data']['supply'] / _con['supply'] * 60 / 2
        if _nt > _supplyTime + _myData['data']['ctime']:
            _distance = _myData['data']['supply'] / _con['supply'] * 60 * _myData['data']['speed']
        else:
            _break = True
    # 还没到时间
    else:
        # 补给足够下 现在时间大于走完的时间  全部完成
        if _nt >= _time + _myData['data']['ctime']:
            _distance = _con['map'][_myData['data']['mapid']]['distance']
        # 中断
        else:
            _break = True

    if _break:
        _need = _con['break']
        _chk = g.chkDelNeed(uid, _need)
        # 消耗不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res
        _res['need'] = _need
        _distance = int((_nt - _myData['data']['ctime']) * _myData['data']['speed'])

    _distance = min(_distance, _con['map'][_myData['data']['mapid']]['distance'])

    # 设置实际的路程，免得最大里程会变成双倍
    realityDistance = _distance
    # 判断是否双倍
    if _isdouble:
        _distance *= 2

    _res['data'] = _myData
    _res['con'] = _con
    _res['distance'] = _distance
    _res["realitydistance"] = realityDistance
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    if 'need' in _chkData:
        _send = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'yjkg_receive'})
        g.sendChangeInfo(conn, _send)

    _kgData = _chkData['data']
    _distance = int(_chkData['distance'])
    _realityDistance = int(_chkData['realitydistance'])
    _con = _chkData['con']
    _mapid = _kgData['data']['mapid']


    # 获取是否双倍
    _isdouble = _kgData['data'].get("double", 0)

    _set = {'$set': {'data': {}},'$inc':{'num.{}'.format(_mapid):1,'milage.{}'.format(_mapid):_distance}}
    # 设置最远考古距离
    if _realityDistance > _kgData['farthest'].get(_mapid, 0):
        _set['$set']['farthest.{}'.format(_mapid)] = _realityDistance

    _set['$set']['exp'] = int(_kgData['exp'] + _distance * _kgData['data']['exp'])
    _set['$set']['energe'] = int(_kgData['energe'] + int(_distance * _con['map'][_mapid]['energe'] * (1 + _kgData['data']['energepro'])))

    _skillCon = g.GC['yjkgskill'][_kgData['data']['mapid']]
    _prize = []
    for i,item in _con['map'][_mapid]['yiji'].items():
        if _realityDistance < item['distance']:
            continue
        _prize += g.m.diaoluofun.getGroupPrize(item['dlz'])
        # 如果学习了技能  并且配置这个id 就要额外获取 能源奖励
        for skill in _kgData['data']['skill']:
            if _skillCon[skill].get('yiji') != i:
                continue
            # 获得奖励
            if _skillCon[skill]['type'] == '2' and g.C.RAND(1000, _skillCon[skill]['pro']):
                _prize += _skillCon[skill]['prize']
            # 获得额外能源
            elif _skillCon[skill]['type'] == '3':
                _set['$set']['energe'] += _skillCon[skill]['num'] if not _isdouble else _skillCon[skill]['num'] * 2
            # 有几率获得古币
            elif _skillCon[skill]['type'] in ('6', '7') and g.C.RAND(1000, _skillCon[skill]['pro']):
                _prize += _skillCon[skill]['prize']




    if _isdouble:
        _prize *= 2
    _prize = g.fmtPrizeList(_prize)

    _send = g.getPrizeRes(uid, _prize, {'act':'yjkg_recieve','distance':_distance,'map':_mapid})
    g.sendChangeInfo(conn, _send)

    # 清除此次考古
    g.mdb.update('yjkg', {'uid': uid}, _set)

    _res['d'] = {'prize':_prize,'distance':_realityDistance,'exp':_set['$set']['exp'] - _kgData['exp'],'energe':_set['$set']['energe'] - _kgData['energe']}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])