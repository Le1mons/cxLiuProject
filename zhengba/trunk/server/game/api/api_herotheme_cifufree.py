#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 赐福免费奖励领取
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

    _idx = int(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(80, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData


    _con = g.m.herothemefun.getCon()
    _cifuCon = _con['cifu'][_idx]
    _data = g.m.herothemefun.getData(uid, _hd['hdid'])

    _val = _data["val"]
    # 任务没有完成
    if _val < _cifuCon["needstar"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 判断是否有奖励需要领取
    if _idx in _data["cifu"]["free"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData


    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _idx = int(data[0])

    _con = g.m.herothemefun.getCon()
    _cifuCon = _con['cifu'][_idx]

    _data = _chkData['data']
    # 添加免费次数
    _data["cifu"]["free"].append(_idx)
    _setData = {}
    _setData["cifu"] = _data["cifu"]

    _prize = _cifuCon["freeprize"]
    # 设置任务领奖
    g.m.herothemefun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'herotheme_cifufree', 'idx':_idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['0'])