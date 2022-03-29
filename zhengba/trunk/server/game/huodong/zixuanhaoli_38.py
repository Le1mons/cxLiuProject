#! /usr/bin/python
# -*-coding:utf-8-*-


"""
自选豪礼
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 38
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    _valInfo = getData(uid, hdinfo)
    _retVal = {"info":hdinfo['data']['arr'],"myinfo": _valInfo}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    _num = abs(int(kwargs['act']))
    hdid = hdinfo['hdid']
    _res = {}
    _valInfo = getData(uid, hdinfo)
    # 判断剩余次数是否足够
    if _valInfo['lessnum'] < _valInfo['usenum'] + _num:
        _res['s'] = -1
        _res['errmsg'] = g.L("zixuanhaoli_-1")
        return _res

    # 扣除剩余次数
    _cdata = {"$inc": {"usenum": _num}, "$push": {"gotarr": idx}}
    # g.m.huodongfun.analysisData(uid, hdid, "tier" + str(idx), 1)
    _r = g.m.huodongfun.setMyHuodongData(uid, hdid, _cdata)
    # 领奖
    _con = hdinfo['data']["arr"][idx]
    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}}

    _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _con["p"]]
    _prizeMap = g.getPrizeRes(uid, _prize,
                              {"act": "hdgetprize", "hdid": hdid, "val": _con["val"]})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _res['cinfo'] = _changeInfo
    # _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys="_id,gotarr,val,lessnum,usenum")
    # _valInfo['maxnum'] = hdinfo['data']['maxnum'] - _valInfo['usenum']
    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
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

def getHongdian(uid, hdid, hdinfo):
    data = getData(uid, hdinfo)
    if data['lessnum'] > data['usenum']:
        return True
    return False

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"$set": {"gotarr": [],"val": 0,'lessnum':0,'usenum':0}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return
    _nt = g.C.NOW()
    # 活动结束
    if _nt > hdinfo['rtime']:
        return

    hdData = getData(uid, hdinfo)
    hdData['val'] += args[2]['unitPrice'] / 100
    # 剩余次数
    hdData['lessnum'] = hdData['val'] / hdinfo['data']['price']
    if hdData['lessnum'] > hdinfo['data']['maxnum']:
        hdData['lessnum'] = hdinfo['data']['maxnum']

    g.m.huodongfun.setMyHuodongData(uid, int(hdinfo['hdid']), hdData)

def getData(uid,hdinfo):
    hdid = hdinfo['hdid']
    _valInfo = g.m.huodongfun.getMyHuodongData(uid,hdid,keys="_id,gotarr,val,lessnum,usenum,lasttime")
    #如果已达到最大使用次数
    # 最大可使用次数
    if g.C.DATE() == g.C.DATE(_valInfo['lasttime']) or hdinfo['data']['reset'] == -1:
        _valInfo['maxnum'] = hdinfo['data']['maxnum'] - _valInfo['usenum']
    else:
        _valInfo['maxnum'] = _valInfo['maxnum'] = hdinfo['data']['maxnum']
        _valInfo['lessnum'] = 0
        _valInfo['val'] = 0
        _valInfo['usenum'] = 0
        g.m.huodongfun.setMyHuodongData(uid,hdid,_valInfo)

    return _valInfo

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 1547653100
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = hdEvent(uid, hdidinfo,'chongzhi',1,1,{'unitPrice': 500000})
    # a = getPrize(uid, hdidinfo,idx=1,act=1)
    a = getOpenData(uid, hdidinfo)
    # a = getHongdian(uid, hdid, hdidinfo)
    print a