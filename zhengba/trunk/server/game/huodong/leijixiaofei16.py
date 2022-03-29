#! /usr/bin/python
# -*-coding:utf-8-*-


"""
累计消费
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 16
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hdData = hdinfo['data']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
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
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt > hdinfo['etime']:
        return _retVal

    # 充值金额满足某一档
    for ele in hdinfo['data']['arr']:
        if _valInfo['val'] >= ele['val'] and ele['val'] not in _valInfo.get('gotarr', []):
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

    setData = {"$inc": {"val": 0}, "$set": {"gotarr": []}}
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