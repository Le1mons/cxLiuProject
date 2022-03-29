#!/usr/bin/python
# coding:utf-8
'''
新年活动3 - 砸蛋
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

    _id = str(data[0])

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
    if _id in _data["eig"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData
    _con = g.GC["newyear3"]
    _need = _con["eigneed"]
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
    _chkData["data"] = _data
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _id = str(data[0])
    _data = _chkData["data"]
    _con = g.GC["newyear3"]

    _need = _con["eigneed"]
    _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'newyear3_eig'})
    g.sendChangeInfo(conn, _delData)
    _prize = []
    _dlz = _con["eigdlz"]
    _prize.extend(g.m.diaoluofun.getGroupPrizeNum(_dlz[0]))
    _prize.extend(g.m.diaoluofun.getGroupPrizeNum(_dlz[1]))

    _data["eig"].append(_id)
    # 如果当前金蛋已经全部砸完就刷新
    if len(_data["eig"]) >= len(_con["eig"]):
        _data["eig"] = []
    _data["val"] += _con["eigjifen"]
    _setData = {}
    _setData["eig"] = _data["eig"]
    _setData["val"] = _data["val"]
    _data["eignum"] = _data.get("eignum", 0) + 1
    _setData["eignum"] = _data["eignum"]
    # 加上保底
    if _data["eignum"] % _con["eigbaodinum"] == 0:
        _prize.extend(_con["eigbaodiprize"])
    g.m.newyear3fun.setData(uid, _chkData['hdid'], _setData)

    _send = g.getPrizeRes(uid, _prize, {'act': 'newyear3_eig', 'idx':  _data["qiandao"]})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[10]))