#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 打开
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'jifen':积分,'prizelist':奖励数组,'time':关闭时间,'pknum':挑战次数,'myrank':我的排名,'freenum':可挑战的免费次数
        'zhanli':战力,'defhero':防守阵容},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 不满18级
    if not g.chkOpenCond(uid,'zypkjjc'):
        _res['s'] = -1
        _res['errmsg'] = g.L('zypkjjc_open_res_-1')
        return _res

    _data = g.m.zypkjjcfun.getUserJJC(uid)
    # 已领取奖励列表
    _prizeList = g.m.zypkjjcfun.getRecPrizeByWeek(uid)
    _con = g.GC['zypkjjccom']['base']
    if not _data:
        _jifen = _con['initjifen']
        _zhanli = 0
        _fightData = {}
    else:
        _jifen = _data['jifen']
        _zhanli = _data.get('zhanli', 0)
        _fightData = _data.get('defhero',{})

    _nt = g.C.NOW()
    _ntWeek = g.C.getWeekFirstDay(_nt)
    _closeTime = _con['closetime']

    # 排名
    # _rankInfo = g.m.rankfun.getArenaRank(1, uid)
    _myRank = g.m.zypkjjcfun.getUserRank(uid, _jifen, _zhanli, 'zypkjjc')

    # 可挑战免费次数
    _freeNum = g.m.zypkjjcfun.getFreeCanPkNum(uid)
    # 挑战次数
    _pkNum = g.m.zypkjjcfun.getPkNumByWeek(uid)
    # 关闭时间
    if _nt - _ntWeek >= _closeTime:
        _time = g.C.getWeekFirstDay(_nt+7*3600*24)
    else:
        _time = _closeTime + _ntWeek

    _resData = {'jifen':_jifen,'prizelist':_prizeList,
                'time':_time,'pknum':_pkNum,'myrank':_myRank,
                'freenum':_freeNum,'zhanli':_zhanli,'defhero':_fightData}
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0])