#! /usr/bin/python
# -*-coding:utf-8-*-
"""
新年祝福
"""

htype = 84
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
    _prize = hdinfo['data']["prize"]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val')

    # 判断奖励是否已经领取
    if hdData["val"]:
        _res['s'] = -1
        _res['errmsg'] = g.L('xianshituangou_res_-6')
        return _res
    hdData["val"] = 1
    g.m.huodongfun.setHDData(uid, hdid, {'val': 1})

    _sendData = g.getPrizeRes(uid, _prize, {'act':'newyearwis', 'hdid': hdid})
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
    _res['stime'] = _hd['stime']
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
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a