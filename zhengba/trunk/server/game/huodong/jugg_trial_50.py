#! /usr/bin/python
# -*-coding:utf-8-*-


"""
剑圣的试炼
"""

import sys
from ZBFight import ZBFight

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 50
import g


def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):

    # 获取当前挑战次数
    _hdData = getRevertNum(uid, hdinfo)
    for d in hdinfo["data"]["npcdata"]:
        npcid = d["npc"]
        _npcList = g.m.npcfun.getNpcById(npcid)
        d["zhanli"] = g.m.npcfun.getNpcZhanli(_npcList)
    hdinfo["data"]["etime"] = hdinfo["etime"]

    _retVal = {"info": hdinfo["data"], "myinfo": _hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    # 1领取
    if int(act) == 1:
        idx = abs(int(idx))
        _hdData = g.m.huodongfun.getMyHuodongData(uid, hdid)
        _con = hdinfo["data"]["arr"][idx]
        _prize = _con["prize"]
        if idx in _hdData["gotarr"]:
            # 已经领取过奖励
            _res['s'] = -1
            _res['errmsg'] = g.L('huodong_jugg_trial_res_-1')
            return _res

        # 判断是否达到领取条件
        if _con["needval"] > _hdData["val"]:
            # 未达到
            _res['s'] = -2
            _res['errmsg'] = g.L('huodong_jugg_trial_res_-2')
            return _res

        _r = g.m.huodongfun.setMyHuodongData(uid, hdid,  {"$push": {"gotarr": idx}})

        _changeInfo = {"item": {}, "attr": {}, "hero": {}}

        _prizeMap = g.getPrizeRes(uid, _prize,
                                  {"act": "hdgetprize", "hdid": hdid, "prize": _prize})
        for k, v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _rData["cinfo"] = _changeInfo
        _rData["myinfo"] = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id')
        _rData["prize"] = _prize
        return _rData
    # 挑战
    elif act == 2:
        _fightData = kwargs['wxcode']
        # 判断是否有挑战次数
        _hdData = getRevertNum(uid, hdinfo, 1)
        if _hdData["num"] <= 0:
            _res['s'] = -2
            _res['errmsg'] = g.L('huodong_jugg_trial_-2')
            return _res

        # 检查战斗参数
        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res

        # 挑战的npc
        _npcid = hdinfo["data"]["npcdata"][idx]["npc"]
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
        # boss战斗信息
        _bossFightData = g.m.fightfun.getNpcFightData(_npcid)
        f = ZBFight('pve')
        _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
        _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
        _winside = _fightRes['winside']

        _setData = {"$inc": {}}
        # 如果赢了
        if _winside == 0:
            _addVal = hdinfo["data"]["npcdata"][idx]["addval"]
            _setData["$inc"] = {"val": _addVal}
            _hdData["val"] += _addVal

        _setData["$inc"].update({"num": -1})
        _hdData["num"] -= 1
        if _hdData["recovertime"] == -1:
            _setData['$set'] = {'recovertime': g.C.NOW()}


        # 设置数据
        _r = g.m.huodongfun.setMyHuodongData(uid, hdid, _setData)
        _resData = {}
        _resData['fightres'] = _fightRes
        _resData["info"] = hdinfo["data"]
        _resData["myinfo"] = _hdData
        return _resData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res


# 生成玩家初始活动数据
def initHdData(uid,hdid,data=None,*args,**kwargs):
    hdInfo = g.m.huodongfun.getInfo(hdid, keys='_id,data,stime')
    _arr = hdInfo["data"]["arr"]
    # 默认初始有个奖励
    _gotArr = []
    # for idx, v in enumerate(_arr):
    #     _gotArr[str(idx)] = 0
    setData = {'gotarr': _gotArr, 'val': 0, "recovertime": hdInfo['stime'], "num": hdInfo["data"]["initnum"]}
    g.m.huodongfun.setHDData(uid, int(hdid), setData)
    return setData


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass


# 红点
def getHongdian(uid, hdid, hdinfo):
    # 获取当前挑战次数
    _hdData = getRevertNum(uid, hdinfo)
    if _hdData['num'] > 0:
        return True

    arr = hdinfo["data"]["arr"]
    # 判断是否有没领的奖励
    for idx, ele in enumerate(arr):
        if ele["needval"] <= _hdData["val"] and idx not in _hdData["gotarr"]:
            return True
    # 判断是否有挑战次数
    return False


# 定时器发奖
def timer_sendPrize():
    # 获取当前时间
    _nt = g.C.NOW()
    # 获取活动的开启和结束时间
    _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'etime': {'$lte': _nt}}, sort=[['etime', -1]])

    # 判断是否发过
    if not _hdInfo or _hdInfo.get("finish", 0):
        return

    hdid = _hdInfo['hdid']
    _etime = _hdInfo['etime']

    # 判定活动是否结束 结束后发奖
    if not _nt >= _etime:
        return

    hddataAll = g.mdb.find("hddata", {'hdid': hdid, 'finish': {'$exists': 0}}, fields=['_id'])
    if not hddataAll:
        return

    # 邮件格式
    _title = _hdInfo["data"]['title']
    _cont = _hdInfo["data"]['title']
    for d in hddataAll:
        _prize = []
        uid = d['uid']
        _val = d["val"]
        _gotArr = d["gotarr"]
        for idx, info in enumerate(_hdInfo["data"]["arr"]):
            if idx not in _gotArr and _val >= info["needval"]:
                _prize += info["prize"]

        # 如果有奖励才发
        if _prize:
            # 合并奖励
            _prize = g.mergePrize(_prize)
            g.m.huodongfun.setHDData(uid, hdid, {'$set': {'finish': 1}})
            g.m.emailfun.sendXitongEmail(_title, _cont, uid=uid, prize=_prize)

    # 设置这个活动表示发奖已经完成
    g.mdb.update("hdinfo", {"hdid": hdid}, {"finish": 1})



# 获取许可证持有数量
# getcd是否获取cd时间和v次数，cd为0时为无cd状态
# getnextcd是否获取下一次cd时间
# isset是否写入数据
def getRevertNum(uid, hdinfo, isset=0):
    # 获取许可证相应配置
    _info = hdinfo["data"]
    _maxNum = _info['maxnum']
    _cdSize = _info['refreshtime']

    _hdid = hdinfo["hdid"]
    # 获取玩家的活动信息
    _hdData = g.m.huodongfun.getMyHuodongData(uid, _hdid, keys='_id')
    _freeTime = _hdData["recovertime"]
    # 获取当前许可证的数量
    _num = _hdData["num"]
    # 如果少于最大拥有数量就刷成最大的拥有数量
    _nt = g.C.NOW()
    if _freeTime == 0:  _freeTime = _nt
    if _num < _maxNum:
        _defTime = _nt - _freeTime
        if _defTime >= _cdSize:
            _addNum = _defTime // _cdSize
            _num += _addNum
            _freeTime += _addNum * _cdSize

    if _num >= _maxNum:
        _num = 5
        _freeTime = -1

    # 写入数据
    if isset:
        # 设置
        g.m.huodongfun.setMyHuodongData(uid, hdinfo["hdid"], {"num": _num, "recovertime": _freeTime})
    _hdData["recovertime"] = _freeTime
    _hdData["num"] = _num
    return _hdData

if __name__ == "__main__":
    # uid = g.buid("liu1")
    # hdid = 50
    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    timer_sendPrize()
