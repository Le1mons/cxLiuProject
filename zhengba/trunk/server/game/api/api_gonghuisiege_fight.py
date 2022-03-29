#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
'''
工会—攻城略地-获取指定城市数据
'''

import g
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn: 
    :param 参数1: idx 必须参数	类型: <type 'int'>	说明:挑战的对手的下标
    :param 参数2: cityid 必须参数	类型: <type 'str'>	说明:城市id
    :param 参数3: fightdata 必须参数	类型: <type 'dict'>	说明:上阵的英雄
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "myinfo": {
                            "winnum": 0, 
                            "uid": "0_5ec48aad9dc6d640cc8ef26b", 
                            "fightnum": 6, 
                            "dkey": "2020-22", 
                            "jifeninfo": {
                                "1": 6
                            }, 
                            "zhanli": 57585, 
                            "sid": 0, 
                            "ttltime": "2020-06-02 19:09:38.048000", 
                            "alljifen": 6, 
                            "ghid": "5ed6b68f9dc6d648c6c5e7c6", 
                            "lasttime": 1591176877, 
                            "groupid": 0, 
                            "ctime": 1591096178
                        }, 
                        "recoverinfo": {
                            "num": -1, 
                            "recovertime": 1591013090
                        }, 
                        "challengeinfo": {
                            "passlist": [
                                0, 
                                0, 
                                0, 
                                0, 
                                0, 
                                0
                            ]
                        }, 
                        "cityrank": {
                            "myrank": -1, 
                            "myval": 6, 
                            "ranklist": [
                                {
                                    "guildname": "电饭锅", 
                                    "rank": 1, 
                                    "jifen": 6
                                }, 
                                {
                                    "guildname": "电饭锅", 
                                    "rank": 2, 
                                    "jifen": 1
                                }, 
                                {
                                    "guildname": "电饭锅", 
                                    "rank": 3, 
                                    "jifen": 1
                                }, 
                                {
                                    "guildname": "电饭锅", 
                                    "rank": 4, 
                                    "jifen": 1
                                }, 
                                {
                                    "guildname": "电饭锅", 
                                    "rank": 5, 
                                    "jifen": 1
                                }
                            ]
                        }
                    }
                }
            }
        ]
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()



def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    # 对手信息下标
    _idx = abs(int(data[0]))
    _cityid = str(data[1])
    # 英雄的站位信息
    _fightData = data[2]

    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    gud = g.getGud(uid)
    # 判断条件
    _openCond = g.GC["gonghuisiege"]["openCond"]
    _openDay = g.getOpenDay()
    _needLv = _openCond[-1][1]
    for cond in _openCond:
        # 判断是否在这个条件下
        if cond[0][0] <= _openDay < cond[0][1]:
            _needLv = cond[1]

    if gud["lv"] < _needLv:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gonghuisiege_opencond')
        return _chkData



    # 判断是否在活动持续时间段内
    if not g.m.gonghuisiegefun.chkOpen():
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData
    # 防守阵容不存在
    if not _fightData:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('zypkjjc_fight_res_-3')
        return _chkData

    # 获取玩家的挑战列表
    _pkinfo = g.m.gonghuisiegefun.getPkUserList(uid, _cityid)
    if len(_pkinfo["pklist"]) <= _idx:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    # 获取玩家的数据
    _myInfo = g.m.gonghuisiegefun.getUserData(uid, keys='_id')
    if not _myInfo:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('zypkjjc_fight_res_-3')
        return _chkData

    # # 判断是否有挑战次数
    _recoverInfo = g.m.gonghuisiegefun.getRevertNum(uid)
    if _recoverInfo["num"] <= 0:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('gonghuisiege_fight_res_-5')
        return _chkData


    # 如果不是npc
    _enemyUid = _pkinfo["pklist"][_idx]["uid"]
    if not _enemyUid.startswith('NPC'):
        # 获取挑战的对手的数据
        _enemyInfo = g.m.gonghuisiegefun.getUserData(_enemyUid)
        if not _enemyInfo:
            _chkData['s'] = -6
            _chkData['errmsg'] = g.L('gonghuisiege_fight_res_-6')
            return _chkData
        if _enemyInfo['ghid'] == g.getGud(uid)['ghid']:
            # 刷新pk数据
            _enemyList = g.m.gonghuisiegefun.refPkUser(uid, _cityid, ref=True)
            g.m.gonghuisiegefun.setPkUserList(uid, _cityid, {"v": _enemyList, "passlist": []})
            _chkData['s'] = -60
            _chkData['errmsg'] = g.L('gonghuisiege_fight_res_-6')
            return _chkData
        _chkData["enemyinfo"] = _enemyInfo
    _chkData["enemyuid"] = _enemyUid


    _chkData["pkinfo"] = _pkinfo
    _chkData["chkFightData"] = _chkFightData
    _chkData["cityid"] = _cityid
    _chkData["idx"] = _idx
    _chkData["fightdata"] = _fightData
    _chkData["myinfo"] = _myInfo
    _chkData["recoverinfo"] = _recoverInfo
    return _chkData




@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _chkFightData = _chkData["chkFightData"]
    _pkinfo = _chkData["pkinfo"]
    _fightData = _chkData["fightdata"]
    _idx = _chkData["idx"]
    # 挑战的城市id
    _cityid = _chkData["cityid"]
    # 我的数据
    _myInfo = _chkData["myinfo"]
    # 恢复类道具的信息
    _recoverInfo = _chkData["recoverinfo"]

    gud = g.getGud(uid)
    # 获取玩家的挑战列表
    _pklist = _pkinfo["pklist"]
    _passList = _pkinfo["passlist"]
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _pklist[_idx]['herolist']).start()

    _fightRes['headdata'] = [_chkFightData['headdata'], _pklist[_idx]['headdata']]

    # 获取玩家是否胜利
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes

    _pklist[_idx]['winside'] = _winside
    _pkinfo["pklist"] = _pklist


    # 日志数据
    _mylog = []
    _enemylog = []
    _setData = {}
    _nt = g.C.NOW()
    # 如果赢了

    _enemyAllJiFen = 0
    if not _winside:
        _passList.append(_idx)
        # 设置积分
        _addjifen = 2
        _setData["winnum"] = _myInfo["winnum"] = _myInfo["winnum"] + 1
        # 设置今日胜场数量
        g.m.gonghuisiegefun.setWinNum(uid)
        # 设置日志
        _mylog = ["5",gud["name"], _pklist[_idx]["headdata"].get("guildname", g.L('siege_guildname')),
                  _pklist[_idx]["headdata"].get("name", g.L('siege_name')), _nt]
        _winGh = gud["ghid"]
        # 如果不是npc,减少对应对方对应的积分和日志数据
        if "enemyinfo" in _chkData:
            _mylog = ["1", gud["name"], _pklist[_idx]["headdata"].get("guildname", g.L('siege_guildname')),
                      _pklist[_idx]["headdata"].get("name", g.L('siege_name')), _nt]
            _addjifen = 5
            _enemylog = ["4", gud["ghname"], gud["name"], _pklist[_idx]["headdata"]["name"], _nt]
            _setEnemyData = {}
            _setEnemyData["alljifen"] = _enemyAllJiFen = _chkData["enemyinfo"]["alljifen"] - 2 if _chkData["enemyinfo"]["alljifen"] - 2 > 0 else 0
            _setEnemyData["jifeninfo"] = _chkData["enemyinfo"]["jifeninfo"]
            _setEnemyData["jifeninfo"][_cityid] = _chkData["enemyinfo"]["jifeninfo"].get(_cityid, 0) - 2 if _chkData["enemyinfo"]["jifeninfo"].get(_cityid, 0) - 2 > 0 else 0
            # 设置对方数据
            g.m.gonghuisiegefun.setUserData(_chkData["enemyuid"], _setEnemyData)
            # 设置对方集团的总积分扣除
            g.m.gonghuisiegefun.setGongHhuiCityJiFen(_chkData["enemyuid"], _cityid, _chkData["enemyinfo"]["ghid"], -2)
        _jifenInfo = {'jifen': _myInfo["alljifen"] + _addjifen,'add':_addjifen,'reduce':-2,'rivaljifen':_enemyAllJiFen,'win_uid':uid}
    else:
        _addjifen = 1
        # 设置日志N
        _enemyAllJiFen = 0
        _mylog = ["3", gud["name"], _pklist[_idx]["headdata"].get("guildname", g.L('siege_guildname')),
                  _pklist[_idx]["headdata"].get("name", g.L('siege_name')), _nt]
        # 如果不是npc,减少对应对方对应的积分和日志数据
        if "enemyinfo" in _chkData:
            _enemyAllJiFen = _chkData["enemyinfo"]["alljifen"]
            _enemylog = ["2", gud["ghname"], gud["name"], _pklist[_idx]["headdata"]["name"], _nt]
        _winGh = _pklist[_idx]["headdata"].get("ghid", "npc")
        _jifenInfo = {'jifen': _myInfo["alljifen"] + _addjifen,'add':0,'reduce':_addjifen,'rivaljifen':_enemyAllJiFen,'win_uid':_chkData["enemyuid"]}

    _pkinfo["passlist"] = _passList
    _setData["fightnum"] = _myInfo["fightnum"] = _myInfo["fightnum"] + 1
    # 记录每个城市的挑战次数
    _setData["fightnuminfo"] = _myInfo.get("fightnuminfo", {})
    _setData["fightnuminfo"][_cityid] = _myInfo.get("fightnuminfo").get(_cityid, 0) + 1
    _setData["alljifen"] = _myInfo["alljifen"] = _myInfo["alljifen"] + _addjifen
    _setData["jifeninfo"] = _myInfo["jifeninfo"]
    _setData["jifeninfo"][str(_cityid)] = _myInfo["jifeninfo"][_cityid] = _myInfo["jifeninfo"].get(_cityid, 0) + _addjifen
    _setData["sid"] = g.getHostSid()
    _setData["groupid"] = g.m.crosscomfun.getServerGroupId(uid)
    # 设置攻城掠地数据
    g.m.gonghuisiegefun.setUserData(uid, _setData)

    # 设置我方日志日志
    _logInfo = {
        "log": _mylog,
        "fight":_fightRes,
        "win": _winGh,
        "jifeninfo":_jifenInfo,
        "ctime": _nt,
        "ttltime":g.C.TTL(),
        "ghid":gud["ghid"],
        "dkey": g.m.gonghuisiegefun.getWeekKey(),
    }
    g.crossDB.insert("gonghui_siege_fightlog", _logInfo)
    # 如果为空表示是npc数据不做处理
    if _enemylog:
        # 设置我方日志日志
        _enemylogInfo = {
            "log": _enemylog,
            "fight": _fightRes,
            "dkey": g.m.gonghuisiegefun.getWeekKey(),
            "win": _winGh,
            "jifeninfo": _jifenInfo,
            "ctime": _nt,
            "ttltime": g.C.TTL(),
            "ghid": _pklist[_idx].get("ghid", "npc")
        }
        g.crossDB.insert("gonghui_siege_fightlog", _enemylogInfo)

    # 扣除挑战次数
    _recoverInfo = g.m.gonghuisiegefun.useChallengeNum(uid, _recoverInfo)

    # 设置我方集团增加的积分
    gud = g.getGud(uid)
    g.m.gonghuisiegefun.setGongHhuiCityJiFen(uid, _cityid, _myInfo["ghid"], _addjifen, ghname=gud["ghname"],setsid=True)

    _set = {"passlist": _passList}
    if len(_passList) >= 6:
        _set['v'] = g.m.gonghuisiegefun.refPkUser(uid, _cityid)
        _pkinfo['passlist'] = _set['passlist'] = []
        _pkinfo['pklist'] = _resData['pklist'] = _set['v']
    g.m.gonghuisiegefun.setPkUserList(uid, _cityid, _set)

    _resData["myinfo"] = _myInfo
    _resData["recoverinfo"] = _recoverInfo
    _resData["challengeinfo"] = _pkinfo
    _resData["jifeninfo"] = _jifenInfo
    # # 获取城市战力的排行
    _resData["cityrank"] = g.m.gonghuisiegefun.getCityRank(uid,_cityid)

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    a = g.getGud(g.buid('xuzhao'))
    g.debugConn.uid = g.buid('xuzhao')
    _data = [1,1,{'1':'5efc51aef386bd21d809830e'}]
    print doproc(g.debugConn,_data)
