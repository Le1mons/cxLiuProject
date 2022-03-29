#!/usr/bin/python
# coding:utf-8
'''
三周年 - 抽奖
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

    _num = int(data[0])

    # 如果次数不在1和10之间
    if _num < 1 or _num > 10:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(77, "etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _nt = g.C.NOW()
    # if _nt > _hd["rtime"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
    #     return _chkData


    _data = g.m.zhounian3fun.getData(uid, _hd['hdid'], keys='lottery')
    _layer = _data["lottery"]["layer"]
    _geziRec = _data["lottery"]["rec"]
    _con = g.m.zhounian3fun.getCon()

    _allNum = 25
    # 判断是否是最后一层，如果是的话就可以一直抽
    if int(_layer) + 1 >_con["maxlayer"]:
        _allNum = 999
    _userNum = sum([num for num in _geziRec.values()])
    _lessNum = _allNum - _userNum
    # 判断次数是否满足
    if _lessNum <= 0:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_lottery')
        return _chkData

    # 判断当前道具可以抽几次
    _itemid = _con["lotteryneed"][0]["t"]
    _itemInfo = g.mdb.find1("itemlist", {"itemid": _itemid, "uid": uid}, fields=["_id", "num"]) or {}
    _itemNum = _itemInfo.get("num", 0)
    # 判断是否满足
    if _itemNum < _num:
        _num = _itemNum
    # 判断剩余道具还可以抽几次
    if _lessNum < _num:
        _num = _lessNum

    # 判断当前是否可以抽奖
    if _num <= 0:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_itemless')
        return _chkData

    _niudanNeed = _con['lotteryneed']
    # 合并奖励
    _need = g.mergePrize(_niudanNeed * _num)
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
    _chkData["hdinfo"] = _hd
    _chkData["need"] = _need
    _chkData["num"] = _num


    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _hdinfo = _chkData["hdinfo"]
    _data = _chkData["data"]
    _need = _chkData["need"]
    _num = _chkData["num"]


    _prize = []
    _con = g.m.zhounian3fun.getCon()
    _layer = _data["lottery"]["layer"]
    _geziInfo = _data["lottery"]["gezi"]
    _geziRec = _data["lottery"]["rec"]

    # 获取当前可以随机的格子，一个格子可以随机两次
    _randomList = []

    for gezi in xrange(25):
        # 如果随机到两次的话就不在随机
        _useNum = _geziRec.get(str(gezi), 0)
        if int(_layer) + 1 > _con["maxlayer"]:

            if _useNum > 0 and len(_geziRec) < 25:
                continue
        else:
            if _useNum > 0:
                continue

        # if _useNum >= 2:
        #     continue
        # for i in xrange(2 - _useNum):
        _randomList.append(gezi)
    # 随机的格子
    _randgezi = g.C.RANDLIST(_randomList, _num)

    _prize = []
    _getgezi = []
    for gezi in _randgezi:
        _prize.extend(list(_geziInfo[gezi]))
        _getgezi.append(gezi)
        _geziRec[str(gezi)] = _geziRec.get(str(gezi), 0) + 1

    _data["lottery"]["rec"] = _geziRec
    # 合并奖励
    _prize = g.mergePrize(_prize)

    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'zhounian3hd_lottery', 'num': _num})
    g.sendChangeInfo(conn, _send)

    # 设置任务领奖
    # 加上额外奖励
    _extRec = _data["lottery"].get("extrec", [])
    extprizechk = _con["extprizechk"]
    extprize = _con["lotteryinfo"]["extprize"]
    _extPrize = []
    for idx, info in enumerate(extprizechk):
        _chk = 1
        if idx in _extRec:
            continue
        for pidx in info["cond"]:
            if str(pidx) not in _geziRec:
                _chk = 0
                break
        if _chk:
            _extRec.append(idx)
            _extPrize.append(idx)
            _prize += list(extprize[idx])
    _data["lottery"]["extrec"] = _extRec


    _setData = {}
    _setData["lottery"] = _data["lottery"]
    g.m.zhounian3fun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'zhounian3hd_lottery', 'num': _num})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize": _prize, "extprize": _extPrize, "getgezi":list(set(_getgezi))}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    arr = []
    # for b in xrange(10000):
    #     _nid = "3"
    print doproc(g.debugConn, [1])
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