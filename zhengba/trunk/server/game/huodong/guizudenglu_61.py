#! /usr/bin/python
# -*-coding:utf-8-*-
"""
贵族登录

"""





htype = 61
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr')

    _day = g.C.getDateDiff(hdinfo['stime'], g.C.NOW()) + 1
    # 已经领取过奖励
    if len(hdData['gotarr']) >= _day or len(hdData['gotarr']) >= len(hdinfo['data']['arr']):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    vip = g.getGud(uid)['vip']
    idx = 0
    for index, i in enumerate(hdinfo['data']['arr'][len(hdData['gotarr'])]):
        if i['vip'] > vip:
            break
        idx = index

    hdDataArr = hdinfo['data']['arr'][len(hdData['gotarr'])][idx]
    # vip等级不足
    if g.getGud(uid)['vip'] < hdDataArr['vip']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitvip')
        return _res

    g.m.huodongfun.setHDData(uid, hdid, {"gotarr.{}".format(len(hdData['gotarr'])): idx})

    _prize = hdDataArr['p']
    _send = g.getPrizeRes(uid, _prize, {'act':'guizudenglu','idx':idx})
    _rData["cinfo"] = _send
    _rData["prize"] = _prize
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

    return _rData


def getHongdian(uid, hdid, hdinfo):
    res = False
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr')
    _day = g.C.getDateDiff(hdinfo['stime'], g.C.NOW()) + 1
    # 已经领取过奖励
    if _day > len(hdData['gotarr']) and len(hdData['gotarr']) < len(hdinfo['data']['arr']):
        res = True
    return res

def initHdData(uid,hdid,data=None,*args,**kwargs):

    setData = {"val": 0,"gotarr": {}}
    if data:
        setData.update(data)
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass