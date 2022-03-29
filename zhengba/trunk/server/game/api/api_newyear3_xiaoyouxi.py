#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 小游戏
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

    _win = bool(data[0])

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
    _con = g.GC["newyear3"]

    _data = g.m.newyear3fun.getData(uid, _hd['hdid'])

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

    _win = bool(data[0])
    _data = _chkData["data"]
    _prize = []
    if _win and not _data["gamenum"]:
        _prize = g.GC["newyear3"]["youxiprize"]
        g.m.newyear3fun.setData(uid, _chkData['hdid'], {"gamenum": 1})
        _data["gamenum"] = 1
    if _prize:
        _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_xiaoyouxi'})
        g.sendChangeInfo(conn, _send)

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    from pprint import pprint

    g.m.dball.writeLog(uid, "newyear3_err", {"jifen": 1, "num": 1})