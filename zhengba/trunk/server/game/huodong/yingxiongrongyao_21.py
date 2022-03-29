#! /usr/bin/python
# -*-coding:utf-8-*-


"""
英雄荣耀
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 21
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    _retVal = {"info":hdInfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        if hdDataArr['id'] not in hdData['val']:
            # 不是一类英雄
            _res['s'] = -3
            _res['errmsg'] = g.L('global_argserr')
            return _res

        if hdData['val'][hdDataArr['id']] < hdDataArr['val']:
            _res['s'] = -4
            _res['errmsg'] = g.L('dianjindaren_getprize_res_-4')
            return _res

        if hdDataArr['val'] in hdData['gotarr'].get(hdDataArr['id'], []):
            _res['s'] = -5
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr.{}".format(hdDataArr['id']): hdDataArr['val']}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, hdDataArr["p"],
                                  {"act": "hdgetprize", "hdid": hdid, "val": hdDataArr["val"], "prize": hdDataArr["p"]})
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

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 充值金额满足某一档
    for ele in hdinfo['data']['arr']:
        if _valInfo['val'].get(ele['id'],0) >= ele['val'] and ele['val'] not in _valInfo['gotarr'].get(ele['id'], []):
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
    hdInfo = g.m.huodongfun.getInfo(hdid, keys='_id,data')
    _con = g.GC['hero']
    _idList = map(lambda x: x['id'], hdInfo['data']['arr'])
    _allHero = g.mdb.find('hero', {'uid': uid}, fields=['_id', 'hid', 'star'])
    _res = {}
    for hero in _allHero:
        if _con[hero['hid']]['pinglunid'] not in _idList:
            continue

        if hero['star'] > _res.get(_con[hero['hid']]['pinglunid'], 0):
            _res[_con[hero['hid']]['pinglunid']] = hero['star']

    setData = {"$set": {"gotarr": {}, 'val':_res}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def onhdEvent(uid, hid, star=None):
    _htype = 21
    # 先查缓存
    _key = 'huodong_' + str(_htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo['rtime']:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': _htype, 'rtime': {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id','rtime','hdid','stime','data'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {'rtime': _nt}, g.C.ZERO(_nt + 3600*24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo['rtime'] - _nt)

    if _nt >= _hdInfo['rtime']:
        return

    _con = g.GC['hero'][hid]

    _plId = _con['pinglunid']
    if _plId not in map(lambda x:x['id'], _hdInfo['data']['arr']):
        return

    _star = star if star else _con['star']
    _hddata = g.m.huodongfun.getMyHuodongData(uid, _hdInfo['hdid'], keys='_id,val,gotarr')
    if _hddata['val'].get(_plId, 0) < _star:
        g.m.huodongfun.setMyHuodongData(uid, _hdInfo['hdid'],{'$set':{'val.{}'.format(_plId):_star}})

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

# 监听英雄统御事件
g.event.on("hero_tongu", onhdEvent)

if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a