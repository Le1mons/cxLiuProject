#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 金蛋积分领奖
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

    _idx = int(data[0])

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
    # 判断是否已经砸过
    if _idx in _data["eigrec"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData

    _eigPrize = g.GC["newyear3"]["eigprize"]
    # 判断条件是否满足
    if _data["val"] < _eigPrize[_idx]["val"]:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _idx = int(data[0])
    _data = _chkData["data"]

    _con = g.GC["newyear3"]
    _prize = _con["eigprize"][_idx]["prize"]

    _data["eigrec"].append(_idx)
    _setData = {}
    _setData["eigrec"] = _data["eigrec"]

    g.m.newyear3fun.setData(uid, _chkData['hdid'], _setData)

    _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_eigrec', 'idx':  _idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[0]))