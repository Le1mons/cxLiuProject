#! /usr/bin/python
# -*-coding:utf-8-*-


"""
财运亨通
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 54
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr,tq')
    hdData['day'] = g.C.getTimeDiff(g.C.NOW(), hdinfo['stime']) + 1
    hdData['maxday'] = g.C.getTimeDiff(hdinfo['rtime'], hdinfo['stime']) + 1
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = str(kwargs['idx'])
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr,tq')
    # 等级不足
    if g.getGud(uid)['lv'] < hdinfo['data']['lv']:
        _res["s"] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _day = g.C.getTimeDiff(g.C.NOW(), hdinfo['stime']) + 1
    # 参数有误
    if int(idx) > _day:
        _res["s"] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _prize, _set = [], {'$push': {}}
    # 普通奖励
    if idx not in hdData['gotarr']['pt']:
        _prize += hdinfo['data']['arr'][idx]['p']
        _set['$push'].update({'gotarr.pt': idx})
    # 特权奖励
    if hdData.get('tq') and idx not in hdData['gotarr']['tq']:
        _prize += hdinfo['data']['arr'][idx]['tqp']
        _set['$push'].update({'gotarr.tq': idx})

    # 没有奖励
    if not _prize:
        _res["s"] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _r = g.m.huodongfun.setHDData(uid, hdid, _set)

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprize", "hdid": hdid, "val": idx})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid, keys='_id,val,gotarr,buynum')
    _rData["prize"] = _prize

    return _rData

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr,tq')
    _day = g.C.getTimeDiff(g.C.NOW(), hdinfo['stime'], 0) + 1
    for key,val in hdinfo['data']['arr'].items():
        if _day < int(key):
            continue
        # 充值了
        if hdData.get('tq') and key not in hdData['gotarr']['tq']:
            _retVal = True
            break
        elif 'tq' not in hdData and key not in hdData['gotarr']['pt']:
            _retVal = True
            break

    return _retVal

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """

    setData = {'val':0,'gotarr':{'tq':[],'pt':[]}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0
    payCon = args[2]
    if payCon['proid'] != hdinfo['data']['chongzhi']['proid']:
        return

    # _prize = hdidinfo['data']['chongzhi']['prize']
    # _send = g.getPrizeRes(uid, _prize, {'act': 'caiyunhengtong'})
    # g.sendUidChangeInfo(uid, _send)

    g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'], {"tq": 1})



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a