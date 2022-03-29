#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公平竞技场-open
'''

def proc(conn, data, key=None):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _idx = int(data[0])
    # 获取公平竞技场是否开启
    _chkOpen = g.m.gongpingjjcfun.isOpen(uid)
    if not _chkOpen["act"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _libaoCon = g.GC["gongpingjjc"]["libao"][_idx]
    _buyNum = _libaoCon["buynum"]
    # 判断是否可以购买
    if not _libaoCon["need"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # 购买礼包
    _libaoInfo = g.m.gongpingjjcfun.getLiBaoInfo(uid)
    # 判断是否超过购买次数
    if _libaoInfo.get(str(_idx), 0) >= _buyNum:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    # 判断消耗
    _need =_libaoCon["need"]
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


    _chkData["libaoinfo"] = _libaoInfo
    _chkData["need"] = _need
    _chkData["prize"] = _libaoCon["prize"]
    _chkData["idx"] = _idx
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _libaoInfo = _chkData["libaoinfo"]
    _need = _chkData["need"]
    _prize = _chkData["prize"]
    _idx = _chkData["idx"]
    # 删除数据
    _sendData = g.delNeed(uid, _need, logdata={'act': 'gpjjc_buylibao', "idx": _idx})
    g.sendChangeInfo(conn, _sendData)

    _libaoInfo[str(_idx)] = _libaoInfo.get(str(_idx), 0) + 1
    # 设置购买数据
    g.m.gongpingjjcfun.setLiBaoInfo(uid, {"v": _libaoInfo})

    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'gpjjc_buylibao', 'prize': _prize, "idx": _idx})
    # 推送
    g.sendUidChangeInfo(uid, _sendData)
    _resData["prize"] = _prize
    _resData["libao"] = _libaoInfo
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ["1"]
    print doproc(g.debugConn,_data)