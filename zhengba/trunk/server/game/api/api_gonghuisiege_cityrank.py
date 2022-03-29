#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-城市势力排行
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1:  cityid 必须参数	类型: <type 'str'>	说明:城市id
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "1": [
                            {
                                "ghname": "电饭锅", 
                                "rank": 1, 
                                "jifen": 1
                            }, 
                            {
                                "ghname": "电饭锅", 
                                "rank": 2, 
                                "jifen": 1
                            }, 
                            {
                                "ghname": "电饭锅", 
                                "rank": 3, 
                                "jifen": 1
                            }
                        ]
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
    _cityinfo = g.GC["gonghuisiege"]["cityinfo"]
    _cityRank = {}
    dkey = g.m.gonghuisiegefun.getWeekKey()
    _groupid = g.m.crosscomfun.getServerGroupId(uid)

    for cityid, info in _cityinfo.items():
        if not info["isopen"]:
            continue

        _ranklist = g.m.gonghuisiegefun.getCityRank(uid, cityid, limit=3)["ranklist"]
        _ranklist = _ranklist[:3]

        # 如果是结算时间，去找到幸运势力
        if g.m.gonghuisiegefun.chkOpen("closetime"):
            _rInfo = g.crossDB.find1("gonghui_siege_rank", {"dkey": dkey, "cityid": cityid, "groupid": _groupid, "lucky": 1},
                                    fields=["_id", "jifen", "ghid", "ghname"])
            if _rInfo:
                _ranklist.append(_rInfo)

        _cityRank[cityid] = _ranklist
    _res["d"] = _cityRank

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)