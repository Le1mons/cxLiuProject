#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 抽奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'int'>	说明:
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "itemchange": {
                    "5f9739a79dc6d620cd80968f": {
                        "itemid": "1001", 
                        "tid": "5f9739a79dc6d620cd80968f", 
                        "num": 3968, 
                        "lasttime": 1614080956
                    }
                }
            }, 
            {
                "": {
                    "s": 1, 
                    "d": {
                        "myinfo": {
                            "libao": {},  礼包数据
                            "task": {
                                "rec": {
                                    "pt": [], 普通奖励
                                    "tq": []  特权奖励领取情况
                                }, 
                                "data": {
                                    "1": 1  任务进度
                                }
                            },
                            "tq": 0,  是否有特权
                            "date": "2021-02-23", 
                            "niudan": {  扭蛋数据
                                "1": {
                                    "1": 2, 
                                    "0": 1, 
                                    "3": 3, 
                                    "2": 2, 
                                    "5": 5, 
                                    "4": 4
                                }, 
                                "2": {
                                    "1": 2, 
                                    "0": 1, 
                                    "3": 2, 
                                    "2": 2, 
                                    "5": 2, 
                                    "4": 1
                                }
                            }, 
                            "duihuan": {}
                        }, 
                        "good": 1,   是否是大奖
                        "prize": [
                            {
                                "a": "attr", 
                                "t": "rmbmoney", 
                                "n": 10
                            }
                        ]
                    }
                }
            }
        ]
    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _nid = str(data[0])
    _num = int(data[1])

    # 如果次数不在1和10之间
    if _num not in (1, 10):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_none')
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
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

    _niudan = _hd["data"]["niudan"][_nid]
    _data = g.m.niudanfun.getData(uid, _hd['hdid'])
    _con = g.m.niudanfun.getCon()
    # 判断扭蛋是否已经结束了
    if _data["over"].get(_nid, 0):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('niudan_lottery_res_-2')
        return _chkData

    _allNum = sum([i["num"] for i in _niudan])

    _userNum = sum([num for num in _data["niudan"].get(_nid, {}).values()])

    _lessNum = _allNum - _userNum
    # 判断次数是否满足
    if _lessNum <= 0:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('niudan_lottery_res_-2')
        return _chkData

    # 判断当前道具可以抽几次
    _itemid = _con["niudanneed"][0]["t"]
    _itemInfo = g.mdb.find1("itemlist", {"itemid": _itemid, "uid": uid}, fields=["_id", "num"]) or {}
    _itemNum = _itemInfo.get("num", 0)
    # 判断是否满足
    if _itemNum < _num:
        _num = _itemNum
    # 判断剩余道具还可以抽几次
    if _lessNum < _num:
        _num = _lessNum

    _niudanNeed = _con['niudanneed']
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

    _nid = str(data[0])

    _prize = []
    niudan = _hdinfo["data"]["niudan"][_nid]
    _good = 0

    for i in xrange(_num):
        _prizeInfo = []
        for idx, v in enumerate(niudan):
            _useNum = _data["niudan"].get(_nid, {}).get(str(idx), 0)
            _lessNum = v["num"] - _useNum
            if _lessNum <= 0:
                continue

            _prizeInfo += [{"p": v["p"], "prize": v["prize"], "idx": idx, "good": v["good"]}]

        _randPrize = g.C.getRandArrNum(_prizeInfo, 1)

        for rand in _randPrize:
            _prize += rand["prize"]
            if _nid not in _data["niudan"]:
                _data["niudan"][_nid] = {}
            _data["niudan"][_nid][str(rand["idx"])] = _data["niudan"].get(_nid, {}).get(str(rand["idx"]), 0) + 1
            if rand["good"]:
                _good = 1

    _end = 0
    _setData = {}
    _setData["niudan"] = _data["niudan"]
    _allNum = sum([i["num"] for i in niudan])

    _userNum = sum([num for num in _data["niudan"].get(_nid, {}).values()])

    _lessNum = _allNum - _userNum
    if _lessNum <= 0:
        _end = 1
        _data["over"][_nid] = 1
        _setData["over"] = _data["over"]


    # 合并奖励
    _prize = g.mergePrize(_prize)
    _con = g.m.niudanfun.getCon()
    _prize += g.mergePrize(list(_con["niudanprize"]) * _num)
    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'niudanhd_niudan', 'num': _num, "nid":_nid})
    g.sendChangeInfo(conn, _send)

    # 设置任务领奖
    g.m.niudanfun.setData(uid, _chkData['hdid'], _setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'niudanhd_niudan', 'num': _num, "nid":_nid})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {"myinfo":_data, "prize": _prize, "good": _good, "end": _end}

    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    arr = []
    # print doproc(g.debugConn, ["3",10])
    for b in xrange(10000):
        _nid = "3"
        _prize = []
        _data= {"niudan":{}}
        _hdinfo = g.m.huodongfun.getHDinfoByHtype(72, "etime")
        niudan = _hdinfo["data"]["niudan"][_nid]
        _good = 0
        _num = 1000
        _chk = 0
        for i in xrange(_num):
            _prizeInfo = []
            base = 0
            for idx, v in enumerate(niudan):
                _useNum = _data["niudan"].get(_nid, {}).get(str(idx), 0)
                _lessNum = v["num"] - _useNum
                if _lessNum <= 0:
                    continue

                _prizeInfo += [{"p": v["p"], "prize": v["prize"], "idx": idx, "good": v["good"]}]
                base += v["p"]
            # print "奖池数量", len(_prizeInfo)

            rand = g.C.getRandArr(_prizeInfo, base)

            _prize += rand["prize"]
            if _nid not in _data["niudan"]:
                _data["niudan"][_nid] = {}
            _data["niudan"][_nid][str(rand["idx"])] = _data["niudan"].get(_nid, {}).get(str(rand["idx"]), 0) + 1

            if rand["good"]:
                _good = 1
                _chk = 1

            if _chk:
                print "抽出极品道具", i
                arr.append(i)
                break
        print "1000次平均值", sum(arr) / 10000