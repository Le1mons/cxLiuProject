#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - dps伤害领奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


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

    _hd = g.m.huodongfun.getHDinfoByHtype(82, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.newyear3fun.getData(uid, _hd['hdid'])

    _con = g.GC["newyear3"]
    _rankPrize = _con["rankprize"]
    _prize = []
    for idx, info in enumerate(_rankPrize):
        # 判断伤害是否满足
        if _data["topdps"] >= info[0][0] and idx not in _data["dpsrec"]:
            _prize.extend(info[1])
            _data["dpsrec"].append(idx)

    # 判断是否有奖励可以领取
    if not _prize:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noprize')
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    _chkData["prize"] = _prize
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _data = _chkData["data"]


    _prize = _chkData["prize"]

    _setData = {}
    _setData["dpsrec"] = _data["dpsrec"]

    g.m.newyear3fun.setData(uid, _chkData['hdid'], _setData)

    _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_dpsrec'})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[0]))