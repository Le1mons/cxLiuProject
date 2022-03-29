#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 战斗
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):
    """

    :param conn:
    :return:
    ::

        [
            {
                "": {
                    "s": 1,
                    "d": {
                        "myinfo": {
                            "libao": {}, 礼包数据
                            "task": {
                                "rec": {
                                    "pt": [], 普通奖励领取情况
                                    "tq": []   特权奖励领取情况
                                },
                                "data": {
                                    "1": 1  任务进度
                                }
                            },
                            "tq": 0,  特权
                            "date": "2021-02-23",
                            "niudan": {   扭蛋数据
                                "1": {
                                    "1": 2,
                                    "0": 1,
                                    "3": 3,
                                    "2": 2,
                                    "5": 5,
                                    "4": 4
                                },
                                "2": {
                                    "1": 2,
                                    "0": 1,
                                    "3": 2,
                                    "2": 2,
                                    "5": 2,
                                    "4": 1
                                }
                            },
                            "duihuan": {}  兑换数据
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

    _fightData = data[0]
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _con = g.m.niudanfun.getCon()["fightinfo"]
    _data = g.m.niudanfun.getData(uid, _hd['hdid'])
    # 判断是否之前
    if _con["neednum"] > _data["click"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    # 判断是否领取
    if _data["todayfight"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_none')
        return _chkData
    # 检查阵容
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    _chkData["chkfightdata"] = _chkFightData
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _fightData = data[0]
    _con = g.m.niudanfun.getCon()["fightinfo"]

    _data = _chkData["data"]

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkData["chkfightdata"]['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_con["npcid"])
    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    # _fightRes['headdata'] = [_chkFightData['headdata'], _chkEnemyData['headdata']]
    _fightRes['headdata'] = [_chkData["chkfightdata"]['headdata'], _bossFightData['headdata']]
    _winside = _fightRes['winside'] = _fightRes['winside'] if _fightRes['winside'] != -2 else 1

    _resData = {'fightres': _fightRes}
    # 如果赢了
    if _winside == 0:
        _prize = _con["prize"]
        _sendData = g.getPrizeRes(uid, _prize, act={'act': 'niudan_fight'})
        g.sendChangeInfo(conn, _sendData)
        # 设置任务领奖
        g.m.niudanfun.setData(uid, _chkData['hdid'], {'todayfight': 1})
        _data["todayfight"] = 1
        _resData["prize"] = _prize

    _resData["myinfo"] = _data

    _res['d'] = _resData

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = [2]
    g.debugConn.argv = _data
    g.debugConn.run()