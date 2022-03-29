#! /usr/bin/python
# -*-coding:utf-8-*-
"""
生日派对
"""



import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 43
import g



def getOpenList(uid, hdinfo):
    # if g.getOpenTime() >= 1568131199 or g.getGud(uid)['ctime'] >= 1568131199:
    #     return
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    day = str(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        _tid = str(len(hdData['gotarr']) + 1)
        if _tid in hdinfo['data']['arr']:
            hdDataArr = hdinfo['data']['arr'][_tid]
            if hdData['val'] < hdDataArr['pval']:
                # 条件不足
                _res['s'] = -2
                _res['errmsg'] = g.L('global_valerr')
                return _res

            _prize = hdDataArr["prize"]
        else:
            _tid = str(len(hdinfo['data']['arr']) + 1)
            _prize = hdinfo['data']["bigprize"]

        # 奖励已领取
        if _tid in hdData['gotarr']:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": _tid}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, _prize, {"act": "hdgetprize", "hdid": hdid, "val": hdData["val"]})
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
        _res['s'] = -4
        _res['errmsg'] = g.L('global_argserr')
        return _res



def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    if g.getOpenTime() >= 1568131199 or g.getGud(uid)['ctime'] >= 1568131199:
        return _retVal
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    _tid = str(len(_valInfo['gotarr']) + 1)
    if _tid in hdinfo['data']['arr']:
        if _valInfo['val'] >= hdinfo['data']['arr'][_tid]['pval'] and _tid not in _valInfo['gotarr']:
            _retVal = True
    else:
        _tid = str(len(hdinfo['data']['arr']) + 1)
        if _tid not in _valInfo['gotarr']:
            _retVal = True

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

    setData = {'val':1, 'gotarr':[], 'date': g.C.DATE(g.C.NOW())}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdTask(uid):
    _hdinfo = g.m.huodongfun.getHDinfoByHtype(htype)
    if not _hdinfo or 'hdid' not in _hdinfo:
        return

    _date = g.C.DATE(g.C.NOW())
    hdData = g.m.huodongfun.getMyHuodongData(uid, _hdinfo['hdid'], keys='_id,date')
    if _date != hdData['date']:
        g.m.huodongfun.setMyHuodongData(uid, _hdinfo['hdid'], {'$inc':{'val': 1},'$set':{'date':_date}})

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

g.event.on('birthday_party', hdTask)



if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdidinfo = g.m.huodongfun.getHDinfoByHtype(htype)
    a = getHongdian(uid, 4300, hdidinfo)
    print a