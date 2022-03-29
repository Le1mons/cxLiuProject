#!/usr/bin/python
# coding:utf-8
'''
夏日庆典 - 签到
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
    _hd = g.m.huodongfun.getHDinfoByHtype(75, "etime")
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
    if _idx > _day:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('vip_getpack_res_-1')
        return _chkData

    _data = g.m.xiariqingdianfun.getData(uid, _hd['hdid'])
    # 判断是否可以领奖
    if _idx in _data["qiandao"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('ONCETASK_ERR4')
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

    _idx = int(abs(data[0]))
    _data = _chkData["data"]

    _data["qiandao"].append(_idx)
    # 设置任务领奖
    g.m.xiariqingdianfun.setData(uid, _chkData['hdid'], {'qiandao': _data["qiandao"]})

    _con = g.GC["xiariqingdian"]["qiandao"]
    _prize = _con[_idx]["prize"]

    _send = g.getPrizeRes(uid, _prize, {'act': 'xiariqingdian_qiandao', 'idx': _idx})
    g.sendChangeInfo(conn, _send)

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])