#!/usr/bin/python
# coding:utf-8
'''
中秋节2 - 奖池
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

    _id = str(data[0])
    _num = int(data[1])
    _hd = g.m.huodongfun.getHDinfoByHtype(78, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _data = g.m.midautumn2fun.getData(uid, _hd['hdid'])

    _con = g.m.midautumn2fun.getCon()

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _lotteryInfo = g.m.midautumn2fun.getLotteryNum(_hd["hdid"], fmt=0)
    # 获取玩家投票次数
    _toupiaoNum = _data["lottery"].get(_id, 0)
    _sumNum = 0
    if _lotteryInfo.get(_id, {}):
        # 奖池总投票次数
        _sumNum = sum([i["num"] for i in _lotteryInfo[_id].values()])
    _needVal = _con["lotteryprize"][_id]["needval"]
    _s, _y = divmod(_sumNum, _needVal)
    # 判断是否达到最大投票次数
    _maxnum = int((_y / _needVal + 1) * _needVal * _con["lotterypro"])
    if _toupiaoNum + _num > _maxnum:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('midautumn2_res_-1')
        return _chkData

    # 抽奖消耗
    _need = _con["lotteryneed"]
    # 合并奖励
    _need = g.mergePrize(_need * _num)
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
    _chkData["data"] = _data
    _chkData['need'] = _need
    _chkData["lotteryinfo"] = _lotteryInfo
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _id = str(data[0])
    _num = int(data[1])

    _data = _chkData["data"]
    _lotteryInfo = _chkData["lotteryinfo"]
    _hdid = _chkData['hdid']
    _need = _chkData['need']

    _con = g.m.midautumn2fun.getCon()

    # 消耗
    if _need:
        _send = g.delNeed(uid, _need, 0, {'act': 'midautumn2_lottery'})
        g.sendUidChangeInfo(uid, _send)

    # 设置投票数据
    _data["lottery"][_id] = _data["lottery"].get(_id, 0) + _num
    _setData = {}
    _setData["lottery"] = _data["lottery"]
    g.m.midautumn2fun.setData(uid, _chkData['hdid'], _setData)

    _ctype = "midautumn2_lotterynum"
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v.{}.{}".format(_id, uid): {"sid": g.getHostSid(), "num":_data["lottery"][_id]}})
    # 设置任务领奖
    g.m.midautumn2fun.setData(uid, _chkData['hdid'], _setData)
    # 投票奖励
    # 增加投票数据
    _ctype2 = "midautumn2_lotterylog"
    gud = g.getGud(uid)
    _log = [_id, _num, gud["name"], g.C.NOW()]
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
    _loglist = []
    if _conData:
        _loglist = _conData[0]["v"]

    _loglist.append(_log)
    _loglist = _loglist[:20]
    g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid},
                                  {"v": _loglist})



    _prize = g.mergePrize(_con["lottreyprize"] * _num)
    _send = g.getPrizeRes(uid, _prize, {'act': 'midautumn2_lottery'})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "lotterynum": g.m.midautumn2fun.getLotteryNum(_hdid), "prize":_prize, "loglist":_loglist}

    return _res

if __name__ == '__main__':
    uid = g.buid("asdd")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=['1', 11]))
