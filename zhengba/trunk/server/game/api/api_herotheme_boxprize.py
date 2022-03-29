#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 领取关卡宝箱奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(80,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _idx = int(data[0])

    _con = g.m.herothemefun.getCon()
    _guankaCon = _con["guankapassprize"][_idx]

    _data = g.m.herothemefun.getData(uid, _hd['hdid'], keys='guankarec')
    # 判断是否能领奖
    for idx in _guankaCon["val"]:
        if idx not in _data["guankarec"]["win"]:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('huodong_jugg_trial_res_-2')
            return _chkData

    # 奖励已经领取
    if _idx in _data["guankarec"]["boxrec"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('giverarepet_get_-2')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData["guankacon"] = _guankaCon
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _idx = int(data[0])

    _guankaCon = _chkData["guankacon"]
    _data = _chkData['data']
    _data["guankarec"]["boxrec"].append(_idx)
    _prize = _guankaCon["prize"]
    g.m.herothemefun.setData(uid, _chkData['hdid'], {"guankarec": _data["guankarec"]})
    _send = g.getPrizeRes(uid, _prize, {'act': 'herotheme_boxprize', 'idx':_idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res['d']['prize'] = _prize

    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])