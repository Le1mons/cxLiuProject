#! /usr/bin/python
# -*-coding:utf-8-*-


"""
新年任务
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 33
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = getHdDataByDate(uid, hdid)

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal



def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _type = str(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    _con = g.GC['newyear_task']
    hdData = getHdDataByDate(uid, hdid)

    # 1领取
    if int(act) == 1:
        if _type not in _con['data']:
            # 参数不对
            _res['s'] = -1
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 未达成目标
        if hdData['val'].get(_type, 0) < _con['data'][_type]['val']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_valerr')
            return _res

        if _type in hdData['gotarr']:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": _type}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, _con["data"][_type]['p'],
                                  {"act": "hdgetprize", "hdid": hdid,"type": _type})
        for k, v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _rData["cinfo"] = _changeInfo
        _rData["myinfo"] = _con["data"][_type]['p']

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = getHdDataByDate(uid, hdid)
    _con = g.GC['newyear_task']
    if len(_valInfo['gotarr']) == len(_con['data']):
        return _retVal

    _nt = g.C.NOW()
    # 充值金额满足某一档
    for i in _con['data']:
        if _valInfo['val'].get(i, 0) >= _con['data'][i]['val'] and i not in _valInfo['gotarr']:
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

    setData = {"$set": {"gotarr": [],'val':{}}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass


# 通过天数判断 获取活动数据
def getHdDataByDate(uid, hdid):
    _mark = g.getAttrByDate(uid, {'ctype':'newyear_task'})
    # 每天更新
    if not _mark:
        g.setAttr(uid, {'ctype': 'newyear_task'}, {'v': 1})
        g.m.huodongfun.setMyHuodongData(uid, int(hdid), {'val': {}, 'gotarr':[]})
        hdData = {'val': {}, 'gotarr': []}
    else:
        hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    return hdData

# 监听新年任务
def onNewYear(uid, tType, num=1):
    hdinfo = g.m.huodongfun.getHDinfoByHtype(33)
    if not hdinfo or 'hdid' not in hdinfo:
        return
    _data = getHdDataByDate(uid, hdinfo['hdid'])
    _con = g.GC['newyear_task']
    # 如果已领取 或者 目标已达成
    if tType in _data['gotarr']:
        return
    if _data['val'].get(tType, 0) >= _con['data'][tType]['val']:
        return
    g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'],
                                    {'$inc': {g.C.STR('val.{1}', tType): num}})


g.event.on('newyear_task', onNewYear)


if __name__ == "__main__":
    uid = g.buid("xuzhao")
    onNewYear(uid, '1')