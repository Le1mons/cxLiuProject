#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
迷宫 - 领取扫荡信息
'''
def proc(conn, data,key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    # 是否自动选择遗物
    _type = str(data[0])
    # 领取信息
    _getData = data[1]

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

    _saodanginfo = g.m.mazefun.getSaoDangInfo(uid)
    if not _saodanginfo.get(_type, []):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('huodong_jugg_trial_res_-1')
        return _chkData

    _reclist = _saodanginfo.get(_type, [])
    # 判断消耗
    if _type == "shoplist":
        _need = []
        _prize = []
        for _idx in _getData:
            _need2 =  list(_reclist[_idx]["need"])
            for i in _need2:
                i['n'] = int(_reclist[_idx]['sale'] * 0.1 * i['n'])
            _need += _need2
            _prize.append(_reclist[_idx]["item"])

        _need = g.mergePrize(_need)
        _prize = g.mergePrize(_prize)
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _chkData['s'] = -100
                _chkData['attr'] = _chk['t']
            else:
                _chkData["s"] = -104
                _chkData[_chk['a']] = _chk['t']
            return _chkData
        if _need:
            _chkData["need"] = _need
            _chkData["prize"] = _prize
    else:
        if len(_getData) != len(_reclist):
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('chat_dendvideo_res_-2')
            return _chkData

    _chkData["maze"] = _maze
    _chkData["reclist"] = _reclist
    _chkData["saodanginfo"] = _saodanginfo
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _maze = _chkData["maze"]
    _reclist = _chkData["reclist"]
    _saodanginfo = _chkData["saodanginfo"]
    # 遗物还是英雄
    _type = str(data[0])
    # 选择的下标列表
    _getData = data[1]

    _resData = {}

    # 判断是否是自动选择遗物
    if _type == "relicprizelist":
        _relic = _maze.get('relic', {})
        for idx, arr in enumerate(_reclist):
            _id = arr[_getData[idx]]
            _relic[_id] = _relic.get(_id, 0) + 1
        _allHero = g.mdb.find('mazehero', {'uid': uid}, fields=['job'])
        # 四个基础属性的pro
        for i in _allHero:
            _buff = g.m.mazefun.getBaseBuffPro(_relic, i['job'], _maze["step"], _maze["diff"])
            if not _buff:
                continue
            g.mdb.update('mazehero', {'uid': uid, '_id': i['_id']}, {'relicbuff': _buff})
        _saodanginfo["relicprizelist"] = []
        g.mdb.update('maze', {'uid': uid}, {"relic": _relic})

    elif _type == "herolist":
        for idx, arr in enumerate(_reclist):
            _hero = arr[_getData[idx]]
            if _maze.get('relic'):
                _buff = g.m.mazefun.getBaseBuffPro(_maze['relic'], _hero['job'],  _maze["step"], _maze["diff"])
                _hero['relicbuff'] = _buff
            # 添加英雄
            g.mdb.insert('mazehero', _hero)
        _saodanginfo["herolist"] = []
    else:
        _saodanginfo["shoplist"] = []


    # 如果有消耗
    if "need" in _chkData:
        _delData = g.delNeed(uid, _chkData["need"],logdata={'act': 'maze_getsaodang', "need": _chkData["need"]})
        g.sendChangeInfo(conn, _delData)

    # 如果有奖励
    if "prize" in _chkData:
        _prizeData = g.getPrizeRes(uid, _chkData["prize"],{'act': "maze_getsaodang", "prize": _chkData["prize"]})
        g.sendChangeInfo(conn, _prizeData)
        _resData["prize"] = _chkData["prize"]


    # 设置扫荡数据
    g.m.mazefun.setSaoDangInfo(uid, _saodanginfo)
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('0')
    g.debugConn.uid = uid
    _data = ["shoplist",[3]]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'