#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 挑战雪人
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

from ZBFight import ZBFight
def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {
            task:{data:{任务id:完成次数}, rec:[已领奖任务id]}
            val: 积分
            jinfenrec: 积分奖励领取记录
            duihuan':{},  兑换
            shop:{},  商店购买次数
            libao:{},  礼包购买次数
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _fightData = data[0]
    _hd = g.m.huodongfun.getHDinfoByHtype(82, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _con = g.GC["newyear3"]
    _bossNum = _con["bossnum"]
    _data = g.m.newyear3fun.getData(uid, _hd['hdid'])
    # 判断是否有挑战次数
    if _data["bossnum"] >= _bossNum:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData


    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _chkData['s'] = _chkFightData['chkres']
        _chkData['errmsg'] = g.L(_chkFightData['errmsg'])
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["data"] = _data
    _chkData["chkfightdata"] = _chkFightData
    _chkData["fightdata"] = _fightData
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _hdid = _chkData['hdid']
    _hd = _chkData["hdinfo"]
    _chkFightData = _chkData["chkfightdata"]
    _fightData = _chkData["fightdata"]
    _data = _chkData["data"]

    _con = g.GC["newyear3"]

    _skillInfo = g.m.newyear3fun.getExtSkill(_chkData['hdid'])

    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    for hero in _userFightData:
        if "hid" not in hero:
            continue
        hero['skill'].append(_skillInfo["beidong"])
    f = ZBFight('pvm')
    _fightRes = f.initFightByData(_userFightData + list(_con["boss"]['boss'])).start()

    _fightRes['headdata'] = [_chkFightData['headdata'], _con["boss"]['headdata']]

    _winside = _fightRes['winside']
    _dps = _fightRes['dpsbyside'][0]

    _prize = []
    for ele in _con["dps2dlz"]:
        if ele[0] > _dps:
            break
        _p = ele[1]["prize"]
        _dlz = ele[1]["dlz"]
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlz)
        _prize.extend(_p)

    _setData = {}
    if _dps > _data["topdps"]:
        _data["topdps"] = _dps
        _setData["topdps"] = _data["topdps"]
        # 增加录像
        _setData["fightlog"] = _fightRes

    _data["bossnum"] += 1
    _setData["bossnum"] = _data["bossnum"]
    _setData["ftime"] = g.C.NOW()
    g.m.newyear3fun.setData(uid, _chkData['hdid'], _setData)

    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'newyear3_fightboss',  "dps": _dps})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {"myinfo": g.m.newyear3fun.getData(uid, _chkData['hdid']),"fightres": _fightRes, "prize":_prize,  "rank":g.m.newyear3fun.getRankList(_chkData['hdid'], _data, uid, limit=5)}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr2")
    g.debugConn.uid = uid
    from pprint import pprint
    _data = [{"1":"61792b7c9dc6d6017fefbac0"}]
    pprint (doproc(g.debugConn, data=_data))