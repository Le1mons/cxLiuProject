#! /usr/bin/python
# -*-coding:utf-8-*-
"""
打地鼠 67
"""

htype = 67
import g


def getOpenList(uid, hdinfo):
    return hdinfo

def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,date,gotarr')
    # 跨天可以领取
    if hdData['date'] != g.C.DATE():
        g.m.huodongfun.setHDData(uid, hdid, {'$set': {'gotarr': False,'date':g.C.DATE()}})
        hdData['gotarr'] = False

    _rank = -1
    # 增加:积分超过240分就不合理就不显示在榜单上
    _list = g.mdb.find('hddata',{'hdid': hdid, 'val': {'$lt': 240}},sort=[['val', -1]],limit=3,fields=['_id','val','name','uid'])
    for idx,i in enumerate(_list):
        if i['uid'] == uid:
            _rank = idx + 1
            break
    else:
        if hdData['val'] > 240:  # 超过240显示为未上榜
            _rank = -1
        else:
            _rank = g.mdb.count('hddata', {'hdid': hdid,'val':{'$gte':hdData['val']}}) + 1

    _retVal = {"info":hdinfo["data"],"myinfo":hdData,'list':_list,'rank':_rank}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    val = int(kwargs['idx'])
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if hdData['gotarr']:
        # 已经领取过奖励
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _set = {'$set':{'gotarr':True,'name':g.getGud(uid)['name']}}
    if val > hdData['val']:
        _set['$set']['val'] = val
    _r = g.m.huodongfun.setHDData(uid, hdid, _set)

    for i in hdinfo['data']['arr']:
        if i[0] <= val <= i[1]:
            _prize = i[2]

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprize", "hdid": hdid, "val": val})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)
    _rData["prize"] = _prize

    return _rData

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """
    初始活动数据
    :param uid:
    :param hdid: int
    :return:
    """
    setData = {"val": 0, "gotarr": False,'date':g.C.DATE()}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)



def getHongdian(uid, hdid, hdinfo):
    _retVal = 0
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if not hdData['gotarr']:
        _retVal = 1
    return _retVal

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    return