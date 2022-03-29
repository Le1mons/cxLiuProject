#! /usr/bin/python
# -*-coding:utf-8-*-


"""
远征统帅
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 14
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    #该活动没有任何值时的特殊处理
    if hdData == None:hdData = {"val":0,"gotarr":[]}
    if "lasttime" in hdData:del hdData["lasttime"]
    if "gotarr" not in hdData:
        hdData["gotarr"] = []
    if 'data' not in hdInfo:
        hdInfo['data'] = {}

    # 加入结束时间
    if 'etime' in hdInfo:
        hdInfo["data"].update({'etime':hdInfo['etime']})

    _retVal = {"info":hdInfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']

    # _hdData = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,htype,data,rtime', iscache=0)
    hdDataArr = hdinfo['data']['arr'][idx]
    # hdDataArr = _hdData["data"]["arr"][idx]

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        if hdDataArr["val"] in hdData.get('gotarr', []):
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        if hdData['val'] < hdDataArr['val']:
            _res['s'] = -4
            _res['errmsg'] = g.L('dianjindaren_getprize_res_-4')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": hdDataArr["val"]}})

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
        _rData["prize"] = hdDataArr["p"]

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt < hdinfo['rtime']:
        return _retVal

    # 已领取
    if len(_valInfo['gotarr']) > 0:
        return _retVal

    # 充值金额满足某一档
    for ele in _valInfo.get('arr',[]):
        if _valInfo['val'] >= ele['val']:
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

    setData = {"$inc": {"val": 0}, "$set": {"gotarr": [],'maxzhanli':g.getGud(uid)['maxzhanli']}}
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