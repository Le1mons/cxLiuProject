#! /usr/bin/python
# -*-coding:utf-8-*-


"""
摇摇乐
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 53
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,prizedate,buynum')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if act == 1:
        # 次数不足
        if hdData['val'] >= hdinfo['data']['num']:
            _res["s"] = -1
            _res['errmsg'] = g.L('global_numerr')
            return _res

        _need = hdinfo['data']['need']
        _set = {"$inc": {"val": 1}}

        _con = g.GC['pifu_lottery']
        _prize = list(_con['prize'])
        _item = g.C.RANDARR(_con['dlz'], sum(i['p'] for i in _con['dlz']))
        _rData['type'] = _item['type']
        # 如果是掉落组
        if 'dlz' in _item:
            _prize += g.m.diaoluofun.getGroupPrize(_item['dlz'])
        else:
            _item = g.C.RANDARR(hdinfo['data']['dlz'], sum(i['p'] for i in hdinfo['data']['dlz']))
            _prize += _item['prize']
    else:
        idx = abs(int(kwargs['idx']))
        # 兑奖次数不足
        if hdData['gotarr'].get(str(idx), 0) >= hdinfo['data']['duihuan'][idx]['num']:
            _res["s"] = -2
            _res['errmsg'] = g.L('global_numerr')
            return _res

        _need = hdinfo['data']['duihuan'][idx]['need']
        _prize = hdinfo['data']['duihuan'][idx]['prize']
        _set = {'$inc': {'gotarr.{}'.format(idx): 1}}

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    g.delNeed(uid, _need, 1, logdata={'act': 'yaoyaole'})

    _r = g.m.huodongfun.setHDData(uid, hdid, _set)

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprize", "hdid": hdid, "atype": act})
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

    setData = {'val':0,'gotarr':{}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a