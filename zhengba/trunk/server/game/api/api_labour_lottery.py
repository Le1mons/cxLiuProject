#!/usr/bin/python
# coding:utf-8
'''
劳动节活动 - 抽奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

        :param conn:
        :param 参数1: num 	类型: <type 'int'>	说明: 抽卡次数
        :return:
        ::

        {'d': {'info': {u'data': {},
                    u'etime': 1620748800,
                    u'hdid': 7302,
                    u'rtime': 1620748800,
                    u'stime': 1618156800},
           'myinfo': {'date': '2021-04-16',
                      'duihuan': {},  兑换
                      'extrec': [],  额外抽奖奖励
                      'fightnum': 0,  战斗次数
                      'libao': {},   礼包购买
                      'lottery': {},  抽奖数据
                      'task': {'data': {}, 'rec': []}, 任务data进度， rec领奖id
                      'topdps': 0}},   最高伤害
        's': 1}
        """
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

    _hd = g.m.huodongfun.getHDinfoByHtype(73, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _nt = g.C.NOW()
    # if _nt > _hd["rtime"]:
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
    #     return _chkData


    _data = g.m.labourfun.getData(uid, _hd['hdid'])
    _con = g.m.labourfun.getCon()

    _allNum = sum([i["num"] for i in _con["lottery"]])

    _userNum = sum([num for num in _data["lottery"].values()])

    _lessNum = _allNum - _userNum
    # 判断次数是否满足
    if _lessNum <= 0:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_itemless')
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
    _con = g.m.labourfun.getCon()
    lottery = _con["lottery"]
    _good = 0

    for i in xrange(_num):
        _prizeInfo = []
        for idx, v in enumerate(lottery):
            _useNum = _data["lottery"].get(str(idx), 0)
            _lessNum = v["num"] - _useNum
            if _lessNum <= 0:
                continue

            _prizeInfo += [{"p": v["p"], "prize": v["prize"], "idx": idx, "good": v["good"]}]

        _randPrize = g.C.getRandArrNum(_prizeInfo, 1)

        for rand in _randPrize:
            _prize += rand["prize"]
            _data["lottery"][str(rand["idx"])] = _data["lottery"].get(str(rand["idx"]), 0) + 1
            # if rand["good"]:
            #     _good = 1

    _end = 0
    _setData = {}
    _setData["lottery"] = _data["lottery"]

    # 合并奖励
    _prize = g.mergePrize(_prize)
    _con = g.m.labourfun.getCon()
    # _prize += g.mergePrize(list(_con["niudanprize"]) * _num)
    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'labourhd_lottery', 'num': _num})
    g.sendChangeInfo(conn, _send)

    # 设置任务领奖
    # 加上额外奖励
    _extRec = _data.get("extrec", [])
    extprize = _con["extprize"]
    _extPrize = []
    for idx, info in enumerate(extprize):
        _chk = 1
        if idx in _extRec:
            continue
        for pidx in info["cond"]:
            if str(pidx) not in _data["lottery"]:
                _chk = 0
                break
        if _chk:
            _extRec.append(idx)
            _extPrize.append(idx)
            _prize += list(info["prize"])
            _setData["extrec"] = _data["extrec"] = _extRec


    g.m.labourfun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'labourhd_lottery', 'num': _num})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize": _prize, "extprize": _extPrize}

    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    arr = []
    # for b in xrange(10000):
    #     _nid = "3"
    print doproc(g.debugConn, [10])
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