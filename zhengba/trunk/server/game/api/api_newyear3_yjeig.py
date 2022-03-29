#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 一键砸蛋
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
    _need = g.mergePrize(_con["eigneed"] * _num)
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
    _con = g.GC["newyear3"]
    _need = _chkData["need"]

    _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'newyear3_eig'})
    g.sendChangeInfo(conn, _delData)

    _data = g.m.newyear3fun.getData(uid, _chkData['hdid'])
    _useNum = len(_con["eig"]) - len(_data["eig"])
    if _num >= _useNum:
        _data["eig"] = []
        _lessNum = _num - _useNum
        _yu = _lessNum % len(_con["eig"])
        for i in xrange(_yu):
            _data["eig"].append(i)
    else:
        _lessList = list(set(xrange(_useNum - _num)) - set(_data["eig"]))
        _data["eig"].extend(list(_lessList[:_useNum - _num]))

    _prize = []
    _dlz = _con["eigdlz"]
    for i in xrange(_num):
        _prize.extend(g.m.diaoluofun.getGroupPrizeNum(_dlz[0]))
        _prize.extend(g.m.diaoluofun.getGroupPrizeNum(_dlz[1]))
        _data["val"] += _con["eigjifen"]
        # 加上保底
        _data["eignum"] = _data.get("eignum", 0) + 1
        if _data["eignum"] % _con["eigbaodinum"] == 0:
            _prize.extend(_con["eigbaodiprize"])
    _setData = {}
    _setData["eig"] = _data["eig"]
    _setData["val"] = _data["val"]
    _setData["eignum"] = _data["eignum"]
    g.m.newyear3fun.setData(uid, _chkData['hdid'], _setData)
    _prize = g.mergePrize(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_yjeig', 'nbum': _num})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr2")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[200]))