#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 上阵
'''
def proc(conn, data,key=None):
    """
    获得通告函的信息

    :param conn:
    :param data:
    :param key:
    :return:
    ::
        {'d': {'tonggaohan': {'num': 1598, 'refreshtime': -1}}, 's': 1}


    """


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    # 羁绊id
    _jid = str(data[0])
    # 位置
    _pos = int(data[1])
    # 英雄tid
    _tid = str(data[2])
    # 外援的uid
    _extUid = str(data[3])
    # 获取羁绊
    _con = g.m.jibanfun.getCon(_jid)
    _isExt = 0
    # 如果是用的外援的

   # 获取玩家的雇佣信息
    _borrowInfo = g.m.jibanfun.getBorrowInfo(uid)
    if _extUid:
        _isExt = 1
        # 获取别人的外援列表
        _dispatchInfo, name = g.m.jibanfun.getDispatchHero(_extUid)
        if _tid not in _dispatchInfo:
            # 该英雄未加入外援列表
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('jiban_uphero_res_-1')
            return _chkData

        if _dispatchInfo[_tid]["uidinfo"]:
            # 武将已经给3个老板打工了，换一个吧
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('jiban_uphero_res_-2')
            return _chkData

        if uid in _dispatchInfo[_tid]["uidinfo"]:
            # 你已经雇佣该武将了
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('jiban_uphero_res_-3')
            return _chkData
        # 不能雇佣同一个玩家的超过3次
        if _extUid in _borrowInfo and len(_borrowInfo[_extUid]) >= 3:
            # 不能雇佣同一个玩家的超过3次
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('jiban_uphero_res_-4')
            return _chkData

        # 获取英雄信息
        _heroData = _dispatchInfo[_tid]
        _chkData["extuid"] = _extUid
        _chkData["dispatchinfo"] = _dispatchInfo
        _chkData["name"] = name
        _chkData["borrowinfo"] = _borrowInfo
    else:
        _heroData = g.m.herofun.getHeroInfo(uid, _tid, keys="_id,star,hid,lv, hid")

        if not _heroData:
            # 英雄不存在
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_heroerr')
            return _chkData

        if "jiban" in _heroData and _heroData["jiban"]:
            # 已经上阵
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('jiban_uphero_res_-6')
            return _chkData

    # 判断位置是否正确
    if _pos >= len(_con["updata"]):
        # 人数已满
        _chkData['s'] = -6
        _chkData['errmsg'] = g.L('jiban_uphero_res_-7')
        return _chkData

    # 判断这个英雄是否符合这个位置的条件
    _hid = _heroData["hid"]
    _heroCon = g.m.herofun.getPreHeroCon(_hid)
    _heroData["star"] = _heroData["star"]

    # 判断颜色是否满足
    if _heroData["star"] < 5:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('jiban_paiqian_res_-2')
        return _chkData

    _plId = _heroCon['pinglunid']
    # 获取这个位置需要的英雄id
    _needplid = _con["chkhero"][_pos]
    if _plId != _needplid:
        # 不满足条件
        _chkData['s'] = -7
        _chkData['errmsg'] = g.L('jiban_uphero_res_-8')
        return _chkData

    _chkData["herodata"] = _heroData
    _chkData["isext"] = _isExt
    _chkData["tid"] = _tid
    _chkData["pos"] = _pos
    _chkData["jid"] = _jid
    _chkData["needplid"] = _needplid
    _chkData["borrowinfo"] = _borrowInfo
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    gud = g.getGud(uid)

    _heroData = _chkData["herodata"]
    _isExt = _chkData["isext"]
    _tid = _chkData["tid"]
    _jid = _chkData["jid"]
    _pos = _chkData["pos"]
    _borrowInfo = _chkData["borrowinfo"]

    # 获取羁绊的数据
    _jiBanInfo = g.m.jibanfun.getJiBanData(uid, _jid)

    _uphero = _jiBanInfo["uphero"]
    _down2Tid = ""
    _down2Data = {}
    # 判断当前位置是否有人
    for _downTid, _downData in _uphero.items():
        if _downData["pos"] == _pos:
            # 先卸下之前歌手
            del _uphero[_downTid]
            _down2Tid = _downTid
            _down2Data = _downData
            break

    _sendData = {}
    _setData = {}
    # 如果当前位置有人
    if _down2Tid:
        # 判断是租借的
        if "isext" in _down2Data and _down2Data["isext"]:
            _dispatch2Info, name = g.m.jibanfun.getDispatchHero(_down2Data["uid"])
            if _down2Tid in _dispatch2Info and uid in _dispatch2Info[_down2Tid]["uidinfo"]:
                # 删除租借状态
                del _dispatch2Info[_down2Tid]["uidinfo"][uid]
                g.m.jibanfun.setDispatchHero(_down2Data["uid"], _dispatch2Info, name=name)
            # 删除我的租借信息

            if _down2Tid in _borrowInfo[_down2Data["uid"]]:
                # 删除
                del _borrowInfo[_down2Data["uid"]][_down2Tid]
                # 记录我租用的英雄
                g.m.jibanfun.setBorrowInfo(uid, _borrowInfo)

        else:
            # 设置英雄解绑羁绊
            g.m.herofun.updateHero(uid, _down2Tid, {"jiban": ""})
            # #  刷新英雄数据
            # _heroChange = g.m.herofun.reSetHeroBuff(uid, _down2Tid, ["jiban"])
            # _sendData.update(_heroChange)

    # 如果租借别人的
    if _isExt:
        _touid = _chkData["extuid"]
        _borrowInfo = _chkData["borrowinfo"]
        # 外援的信息
        _dispatchInfo, name = g.m.jibanfun.getDispatchHero(_touid)
        _dispatchInfo[_tid]["uidinfo"].update({uid: gud["name"]})
        # 设置援助阵容
        g.m.jibanfun.setDispatchHero(_touid, _dispatchInfo, name=name)
        # 加入我使用的援助列表
        if _touid not in _borrowInfo:  _borrowInfo[_touid] = {}
        _borrowInfo[_touid].update({_tid: _pos})
        # 记录我租用的英雄
        g.m.jibanfun.setBorrowInfo(uid, _borrowInfo)
        # 设置租用内容
        _uphero.update({_tid: {"uid": _touid, "pos": _pos, "isext": 1, "star": _heroData["star"], "name": _chkData["name"], "hid": _heroData["hid"], "tid": _tid}})

    else:
        # 设置英雄已经绑定羁绊
        g.m.herofun.updateHero(uid, _tid, {"jiban": _jid})
        _uphero.update({_tid: {"pos": _pos, "isext": 0, "star": _heroData["star"], "name": gud["name"], "hid": _heroData["hid"], "tid": _tid}})

    _setData["uphero"] = _uphero
    _setData["lv"] = g.m.jibanfun.chkJiBanLv(_jid, _uphero)
    # 设置羁绊
    g.m.jibanfun.setJiBanData(uid, _jid, _setData)

    # 等级发生改变就刷新英雄数据
    if _setData["lv"] != _jiBanInfo["lv"]:
        _con = g.m.jibanfun.getCon(_jid)
        _hidList = []
        for _plid in _con["chkhero"]:
            _hidData = g.GC["pre_hero_pinglun"][_plid]
            _hidList += _hidData.keys()
        # 获取玩家羁绊对应的buff
        _buff = g.m.jibanfun.getAllJiBanBuff(uid)
        g.m.userfun.setCommonBuff(uid, {'buff.jiban': _buff})
        _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"hid": {"$in": _hidList}, "lv": {"$gt": 1}})
        _sendData.update(_heroChange)

    # 推送事件
    g.sendChangeInfo(conn, {"hero": _sendData})

    _jiBanInfo["lv"] = _setData["lv"]
    _jiBanInfo["uphero"] = _uphero
    _res["d"] = _jiBanInfo
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('320')
    g.debugConn.uid = uid
    _data = ["1", 1, "5dfb40789dc6d647b578ae72", ""]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'