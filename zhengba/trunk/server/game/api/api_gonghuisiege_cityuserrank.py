#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-玩家城市个人挑战排行
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1: act 必须参数	类型: <type 'str'>	说明: 1是本服势力排行，2是跨服排行
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "ranklist": {
                            "myrank": -1, 
                            "myval": 7, 
                            "ranklist": [
                                {
                                    "headdata": {
                                        "head": "41023", 
                                        "ghname": "电饭锅", 
                                        "uid": "0_5ec48aad9dc6d640cc8ef26b", 
                                        "headborder": "1", 
                                        "title": 2, 
                                        "chatborder": "1", 
                                        "logintime": 1591378861, 
                                        "wzyj": 0, 
                                        "ext_servername": "07", 
                                        "maxzhanli": 84779, 
                                        "lv": 300, 
                                        "sumzhanli": 71086, 
                                        "vip": 5, 
                                        "zhanli": 57585, 
                                        "sid": 0, 
                                        "uuid": "0368171", 
                                        "model": "43012", 
                                        "lasttime": 1591378904, 
                                        "ghid": "5ed6b68f9dc6d648c6c5e7c6", 
                                        "ghpower": 0, 
                                        "name": "temp_b8c8c1b4"
                                    }, 
                                    "val": 7, 
                                    "rank": 1
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

    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-2')
        return _chkData

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
    _ghid = gud["ghid"]
    dkey = g.m.gonghuisiegefun.getWeekKey()
    _groupid = g.m.crosscomfun.getServerGroupId(uid)
    _w = {"dkey": dkey,  "groupid": _groupid, "ghid": _ghid}
    _rInfo = g.crossDB.find("gonghui_siege", _w, fields=["_id", "alljifen", "ghid", "uid", "jifeninfo", "fightnuminfo"])
    _citydata = {}
    # for data in _rInfo:
    #     uid = data["uid"]
    #     for _cityid, num in data.get("fightnuminfo", {}).items():
    #         if _cityid not in _citydata: _citydata[_cityid] = {}
    #         _citydata[_cityid][uid] = {}
    #         _citydata[_cityid][uid]["fightnum"] = num
    #         _citydata[_cityid][uid]["jifen"] = data["jifeninfo"].get(_cityid, 0)
    #         _citydata[_cityid][uid]["uid"] = data["uid"]
    #         _citydata[_cityid][uid]["headdata"] = g.m.userfun.getShowHead(data["uid"])
    # _cityRank = {}
    # for cityid, info in _citydata.items():
    #     rankList = sorted(info.items(), key=lambda i:(int(i[1]["fightnum"]), int(i[1]["jifen"])), reverse=True)
    #     rankList = [rank[1] for rank in rankList]
    #     _cityRank[cityid] = rankList

    for data in _rInfo:
        _uid = data["uid"]
        data["headata"] = g.m.userfun.getShowHead(_uid)
        _citydata[_uid] = data

    _res["d"] = _citydata

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['']
    print doproc(g.debugConn,_data)