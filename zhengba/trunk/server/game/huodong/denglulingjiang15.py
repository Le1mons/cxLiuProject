#! /usr/bin/python
# -*-coding:utf-8-*-


"""
登陆领奖
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 15
import g



def getOpenList(uid, hdinfo):
    # 判断是否是周年领奖
    if hdinfo["data"].get("zhounian", 0):
        return
    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hdData = hdinfo['data']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    _lasttime = hdData['lasttime']
    _nt = g.C.NOW()
    if not g.C.chkSameDate(_nt, _lasttime):
        setData = {"$inc": {"val": 1}}
        g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)
        if len(hdinfo["data"]["arr"]) > len(hdData["gotarr"]):
            hdData['val'] += 1
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
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

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = getOpenData(uid, hdinfo)['myinfo']
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt > hdinfo['rtime']:
        return _retVal

    # 充值金额满足某一档
    for ele in hdinfo['data']['arr']:
        if _valInfo['val'] >= ele['val'] and ele['val'] not in _valInfo.get('gotarr', []):
            _retVal = True
            break

    return _retVal
# 异步按钮显示
def chkOpen(uid):
    _res = {}
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    # 判断活动是否开启
    if not _hdinfo:
        return _res
    # 判断是否是周年
    if not _hdinfo["data"].get("zhounian", 0):
        return _res
    # _hd = getOpenData(uid, _hdinfo)
    # # 判断是否有礼包可以购买
    # if not _hd["info"]["data"]:
    #     return _res

    _res["act"] = 1
    _res["hdid"] = _hdinfo["hdid"]
    _res["stime"] = _hdinfo["stime"]
    _res["etime"] = _hdinfo["etime"]
    return _res
    # _res["rtime"] = _hdinfo["rtime"]



def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """

    setData = {"$inc": {"val": 1}, "$set": {"gotarr": []}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("1")
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, 1500)
    print _valInfo