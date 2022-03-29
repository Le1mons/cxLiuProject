#! /usr/bin/python
# -*-coding:utf-8-*-
"""
新年红包
"""

htype = 85
import g



def getOpenList(uid, hdinfo):
    return None


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val')

    _retVal = {"myinfo":hdData, "info":hdinfo["data"]}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    # 要购买的数量
    act = kwargs['act']
    hdid = hdinfo['hdid']
    gud = g.getGud(uid)
    _lv = gud["lv"]

    _dlz = [{"num": [0, 665], "p":1}]
    if _lv >= 50:
        _dlz = [{"num": [666, 999], "p":40}, {"num": [1000, 1999], "p":30},
             {"num": [2000, 2999], "p":20}, {"num":[3000, 4999], "p":6}, {"num": [5000, 7999], "p":3}, {"num":[8000, 9999], "p":1}]
    _random = g.C.getRandArrNum(_dlz, 1)[0]
    _num = g.C.RANDINT(_random["num"][0], _random["num"][1])
    _prize = [{"a": "attr", "t": "rmbmoney", "n": _num}]



    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val')

    _nt = g.C.NOW()
    if _nt < hdinfo["rtime"]:
        _res['s'] = -1
        _res['errmsg'] = g.L('yueka_getprize_res_-1')
        return _res

    # 判断奖励是否已经领取
    if hdData["val"]:
        _res['s'] = -1
        _res['errmsg'] = g.L('xianshituangou_res_-6')
        return _res
    hdData["val"] = 1
    g.m.huodongfun.setHDData(uid, hdid, {'val': 1})

    _sendData = g.getPrizeRes(uid, _prize, {'act':'newyearhongbao', 'hdid': hdid})
    g.sendUidChangeInfo(uid, _sendData)
    _rData["myinfo"] = hdData
    _rData["prize"] = _prize
    return _rData


# 检测是否开启
def checkOpen(uid):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    if not _hd or 'hdid' not in _hd:
        return _res

    hdData = g.m.huodongfun.getMyHuodongData(uid, _hd["hdid"], keys='_id,val')
    if hdData["val"]:
        return _res

    _res['act'] = True
    _res["stime"] = _hd["stime"]
    _res["hdid"] = _hd["hdid"]
    _res['rtime'] = _hd['rtime']
    _res["etime"] = _hd["etime"]
    return _res


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {"val": 0}

    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("2")
    hdid = 1000
    _lv = 20
    _dlz = [{"num": [0, 665], "p": 1}]
    if _lv >= 50:
        _dlz = [{"num": [666 - 999], "p": 40}, {"num": [1000, 1999], "p": 30},
                {"num": [2000, 2999], "p": 20}, {"num": [3000, 4999], "p": 6}, {"num": [5000, 7999], "p": 3},
                {"num": [8000, 9999], "p": 1}]
    for i in xrange(10000):
        _random = g.C.getRandArrNum(_dlz, 1)[0]
        _num = g.C.RANDLIST(_random["num"][0], _random["num"][1])
        print _num
        # _prize = [{"a": "attr", "t": "rmbmoney", "n": _num}]
        # print _prize