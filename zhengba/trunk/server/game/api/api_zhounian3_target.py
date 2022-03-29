#!/usr/bin/python
# coding:utf-8
'''
三周年 - 选择目标奖励
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


    _hd = g.m.huodongfun.getHDinfoByHtype(77, "etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _nt = g.C.NOW()

    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='lottery')
    _target = _data["lottery"]["target"]
    _layer = _data["lottery"]["layer"]
    _targetNum = _data["lottery"]["targetrnum"]
    _con = g.m.zhounian3fun.getCon()
    _targetPrize = _con["targetprize"]

    if _targetNum.get(_id, 0) >= _targetPrize[_id]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    # 判断是否达到层数
    if _targetPrize[_id]["layer"] > _layer:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_hdnoopen')
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

    _data = _chkData["data"]

    _id = str(data[0])
    # # 老的选择的次数要扣除
    # _oldId = _data["lottery"]["target"]
    # if _oldId != -1:
    #     _data["lottery"]["targetrnum"][_oldId] = _data["lottery"]["targetrnum"].get(_oldId, 0) - 1
    _data["lottery"]["target"] = _id

    _setData = {}
    _setData["lottery"] = _data["lottery"]
    g.m.zhounian3fun.setData(uid, _chkData['hdid'], _setData)

    _res['d'] = {"myinfo":_data}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    arr = []
    # for b in xrange(10000):
    #     _nid = "3"
    print doproc(g.debugConn, ["1"])
    #     _prize = []
    #     _data= {"niudan":{}}
    #     _hdinfo = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    #     niudan = _hdinfo["data"]["niudan"][_nid]
    #     _good = 0
    #     _num = 1000
    #     _chk = 0
    #     for i in xrange(_num):
    #         _prizeInfo = []
    #         base = 0
    #         for idx, v in enumerate(niudan):
    #             _useNum = _data["niudan"].get(_nid, {}).get(str(idx), 0)
    #             _lessNum = v["num"] - _useNum
    #             if _lessNum <= 0:
    #                 continue
    #
    #             _prizeInfo += [{"p": v["p"], "prize": v["prize"], "idx": idx, "good": v["good"]}]
    #             base += v["p"]
    #         # print "奖池数量", len(_prizeInfo)
    #
    #         rand = g.C.getRandArr(_prizeInfo, base)
    #
    #         _prize += rand["prize"]
    #         if _nid not in _data["niudan"]:
    #             _data["niudan"][_nid] = {}
    #         _data["niudan"][_nid][str(rand["idx"])] = _data["niudan"].get(_nid, {}).get(str(rand["idx"]), 0) + 1
    #
    #         if rand["good"]:
    #             _good = 1
    #             _chk = 1
    #
    #         if _chk:
    #             print "抽出极品道具", i
    #             arr.append(i)
    #             break
    # print "1000次平均值", sum(arr) / 10000