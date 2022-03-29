#!/usr/bin/python
# coding:utf-8
'''
元宵活动3 - 抽奖
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
    _num = int(data[0])

    _hd = g.m.huodongfun.getHDinfoByHtype(83, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    # 判断抽卡数量
    if _num not in (1, 10,):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _con = g.m.yuanxiao3fun.getCon()

    _need = g.mergePrize(_con["lotteryneed"] * _num)
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chk['t']
        else:
            _chkData["s"] = -104
            _chkData[_chk['a']] = _chk['t']
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["need"] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _num = int(data[0])

    _need = _chkData["need"]
    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'yuanxiao3hd_lottery', 'num': _num})
    g.sendChangeInfo(conn, _send)

    _prize = []
    _con = g.m.yuanxiao3fun.getCon()
    _dlz = _con["lotterydlz"]
    for i in xrange(_num):
        # 掉落组奖励
        p1 = g.m.diaoluofun.getGroupPrizeNum(_dlz[0], 1)
        p2 = g.m.diaoluofun.getGroupPrizeNum(_dlz[1], 1)
        _prize.extend(p1)
        _prize.extend(p2)

    _prize = g.mergePrize(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act': 'yuanxiao3hd_lottery', 'num':_num})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}


    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    from pprint import pprint


    _con = g.m.yuanxiao3fun.getCon()
    _dlz = _con["lotterydlz"]
    for i in xrange(10000):
        _prize = []
        # 掉落组奖励
        p1 = g.m.diaoluofun.getGroupPrizeNum(_dlz[0], 1)
        p2 = g.m.diaoluofun.getGroupPrizeNum(_dlz[1], 1)
        _prize.extend(p1)
        _prize.extend(p2)

        pprint (_prize)