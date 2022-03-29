#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
迷宫 - 扫荡
'''
def proc(conn, data,key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    # 是否自动选择遗物
    _isyw = bool(data[0])
    _ishero = bool(data[1])


    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    _chkData['d'] = {'cd': g.m.mazefun.getResetTime()}
    _maze = g.mdb.find1('maze', {'uid': uid}, fields={'_id': 0, 'uid': 0, 'ctime': 0})
    # 数据已存在
    if not _maze or g.C.NOW() >= _maze['cd']:
        _chkData['s'] = -1
        return _chkData
    # 历史通关十次
    # _total = _maze.get('total', {})
    # if _total.get("3", 0) < 10:
    #     _chkData['s'] = -3
    #     _chkData['errmsg'] = g.L('maze_saodang_-1')
    #     return _chkData

    _chkData["data"] = _maze
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _data = _chkData["data"]

    # 是否自动选择遗物
    _isyw = bool(data[0])
    _ishero = bool(data[1])

    _resData = {}

    _maze = _data["maze"]
    _trace = _data["trace"]
    _step = _data["step"]
    _total = _data.get('total', {})
    _receive = _data.get("receive", 0)
    _con = g.GC["mazecom"]["base"]
    _level = _con["level"]
    # 扫荡的最大层数
    _maxStep = 2
    _setData = {}
    _prize = []
    _relicprizeList = []
    _heroList = []
    _shopList = []
    _diff = "1"
    _ztlexp = 0
    for i in xrange(1, _maxStep + 1):
        # 如果不是同一层就先生成数据
        _nextStep = i
        if _nextStep < _step:
            continue
        if _nextStep > _step:
            _mazeData = g.m.mazefun.getMazeData(uid, str(_nextStep), _diff, [uid])
            _data = {
                '$set': {
                    'ctime': g.C.NOW(),
                    'trace': {'1': {'idx': 0, 'finish': 1}},
                    'maze': _mazeData,
                    'step': int(_nextStep),  # 第一关
                    'diff': _diff,  # 难度
                    'lasttime': g.C.NOW()
                },
                "$unset": {i: 1 for i in ('fightless', 'receive')}
            }
            g.mdb.update('maze', {'uid': uid}, _data, upsert=True)
            # 修改初始数据
            _maze = _mazeData
            _step = int(_nextStep)
            _trace = {'1': {'idx': 0, 'finish': 1}}
            _receive = 0

        for i in xrange(1, _level + 1):
            _info = _maze[str(i)]
            # 判断本层是否完成
            if str(i) in _trace and _trace[str(i)]["finish"]:
                continue
            # 随机本次的格子落点
            _randomList = list(xrange(len(_info)))
            _chk = False
            _idx = 0
            _num = 0
            while not(_chk or _num >= 20):
                _idx = g.C.RANDLIST(_randomList)[0]
                _chk = g.m.mazefun.chkCanChess(str(i), _idx, _trace[str(int(i) - 1)]['idx'])
                _num += 1

            _eventData = _info[_idx]
            # 获取时间event
            _event = _info[_idx]['event']
            # 战斗 先提取战斗信息
            if _event in ('2', '3', '4'):
                _prize += list(_eventData['prize'])
                if 'reliccolor' in _eventData:
                    # 随机三个遗物让他选
                    _relicprize = g.m.mazefun.getWinRelic(_eventData['reliccolor'], _maze.get('relic', {}))
                    _relicprizeList.append(_relicprize)

            # 灵魂囚笼
            elif _event == '6':
                _heroList.append(_eventData["hero"])
            # 神秘商人
            elif _event == '8':
                _shopList.extend(_eventData["goods"])

            _trace[str(i)] = {"idx": _idx, "finish": 1}
            if int(i) == _level:
                _total[str(_nextStep)] = _total.get(str(_nextStep), 0) + 1

            # 增加征讨令经验
            _ztCon = g.GC['zhengtao']['base']['maze'][str(_step)][_diff]
            if _event in _ztCon:
                _ztlexp += _ztCon[_event]
        if not _receive:
            _prize += list(_con['maze'][str(_nextStep)][_diff]['prize'])
        # 修改征讨令数据
        g.mdb.update('zhengtao', {'uid': uid}, {'$inc': {'exp': _ztlexp}})
    # 修改数据
    _setData["trace"] = _trace
    _setData['receive'] = 1
    _setData['total'] = _total

    g.mdb.update('maze', {'uid': uid}, _setData)
    #
    # 设置
    _recInfo = {}
    _recInfo["shoplist"] = _shopList
    _recInfo["herolist"] = _heroList
    _recInfo["relicprizelist"] = _relicprizeList
    # 判断是否是自动选择遗物
    if _isyw:
        _relic = _data.get('relic', {})
        for arr in _relicprizeList:
            _id = arr[0]
            _relic[_id] = _relic.get(_id, 0) + 1
        _allHero = g.mdb.find('mazehero', {'uid': uid}, fields=['job'])
        # 四个基础属性的pro
        for i in _allHero:
            _buff = g.m.mazefun.getBaseBuffPro(_relic, i['job'], _step, _diff)
            if not _buff:
                continue
            g.mdb.update('mazehero', {'uid': uid, '_id': i['_id']}, {'relicbuff': _buff})

        del _recInfo["relicprizelist"]
        g.mdb.update('maze', {'uid': uid}, {"relic": _relic})

    # 判断是否是自动选择英雄
    if _ishero:
        for arr in _heroList:
            _hero = arr[0]
            if _data.get('relic'):
                _buff = g.m.mazefun.getBaseBuffPro(_data['relic'], _hero['job'],  _step, _diff)
                _hero['relicbuff'] = _buff
            # 添加英雄
            g.mdb.insert('mazehero', _hero)
        del _recInfo["herolist"]

    # 设置扫荡数据
    g.m.mazefun.setSaoDangInfo(uid, _recInfo)



    # 判断是否有奖励
    if _prize:
        _prize = g.mergePrize(_prize)
        _send = g.getPrizeRes(uid, _prize, {'act': 'maze_saodang'})
        g.sendChangeInfo(conn, _send)
    _resData["prize"] = _prize
    _resData["data"] = g.mdb.find1('maze', {'uid': uid}, fields={'_id':0,'uid':0,'ctime':0})
    _resData["hero"] = g.mdb.find('mazehero', {'uid': uid}, fields=['_id','tid','hid','lv','star','zhongzu','zhanli','skin'])
    _resData["herolist"] = _recInfo.get("herolist", [])
    _resData["relicprizelist"] = _recInfo.get("relicprizelist", [])
    _resData["shoplist"] = _recInfo["shoplist"]
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('yyw')
    g.debugConn.uid = uid
    _data = [0,0]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'