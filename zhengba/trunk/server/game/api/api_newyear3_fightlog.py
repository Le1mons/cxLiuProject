#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 战斗录像
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

    _toUid = data[0]
    _hd = g.m.huodongfun.getHDinfoByHtype(82, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.mdb.find1('hddata', {'uid': _toUid, 'hdid': _hd["hdid"]}, fields={'_id': 0, 'fightlog': 1})
    if not _data or "fightlog" not in _data:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["data"] = _data
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _myinfo = _chkData["data"]
    _res['d'] = {"fightres": _myinfo["fightlog"]}

    return _res

if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[10]))