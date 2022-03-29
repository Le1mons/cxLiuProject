#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 签到
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

    # _nt = g.C.NOW()
    # if _nt >= _hd["rtime"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_hdnoopen')
    #     return _chkData

    _nt = g.C.NOW()
    # 判断今天是第几天
    _day = g.C.getDateDiff(_hd["stime"], _nt)
    # if _idx > _day:
    #     _chkData['s'] = -3
    #     _chkData['errmsg'] = g.L('vip_getpack_res_-1')
    #     return _chkData

    _prize = []
    _data = g.m.newyear3fun.getData(uid, _hd['hdid'])
    _con = g.GC["newyear3"]["qiandao"]

    for i in xrange(_day + 1):
        # 判断是否可以领奖
        if i not in _data["qiandao"]:
            _prize.extend(_con[i]["prize"])
            _data["qiandao"].append(i)


    # 判断是否右奖励
    if not _prize:
        _chkData['s'] = -1
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
    # 设置任务领奖
    g.m.newyear3fun.setData(uid, _chkData['hdid'], {'qiandao': _data["qiandao"]})

    _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_qiandao', 'idx':  _data["qiandao"]})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])