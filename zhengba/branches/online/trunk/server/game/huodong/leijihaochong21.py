#! /usr/bin/python
# -*-coding:utf-8-*-


"""


"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 22
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _recIdx = -1
    for _idx, i in enumerate(hdinfo['data']['arr']):
        if hdData['val'] >= i['val']:
            _recIdx = _idx
        else:
            break
    hdData['recidx'] = _recIdx

    _retVal = {"info":hdInfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    # _hdData = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,htype,data,rtime', iscache=0)
    hdDataArr = hdinfo['data']['arr'][idx]
    # hdDataArr = _hdData["data"]["arr"][idx]

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        if not hdinfo['rtime'] <= g.C.NOW() <= hdinfo['etime']:
            # 还每到领取时间
            _res['s'] = -2
            _res['errmsg'] = g.L('global_hdnoopen')
            return _res

        if len(hdData.get('gotarr',[])) != 0:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        if hdDataArr['val'] > hdData['val']:
            # 没达到要求
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        _recIdx = -1
        for _idx,i in enumerate(hdinfo['data']['arr']):
            if hdData['val'] >= i['val']:
                _recIdx = _idx
            else:
                break

        if _recIdx != idx:
            # 没达到要求
            _res['s'] = -5
            _res['errmsg'] = g.L('global_noprize')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": hdDataArr['val']}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}, 'hunshi': {}}

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
    _retVal = 0
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if not hdinfo['rtime'] <= g.C.NOW() <= hdinfo['etime']:
        return _retVal

    # 充值金额满足某一档
    for ele in hdinfo['data']['arr']:
        if _valInfo['val'] >= ele['val'] and len(_valInfo['gotarr']) == 0:
            _retVal = 1
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
    # _val = g.m.payfun.getAllPayYuan(uid)
    setData = {"$inc": {"val": 0}, "$set": {"gotarr": []}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0

    hdid = hdinfo['hdid']
    _myData = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _payMoney = int(args[2]['rmbmoney']) * 0.01
    payCon = args[2]
    _val = _myData['val'] + int(payCon['unitPrice'] * 0.01)
    _setData = {'val': _val}
    g.m.huodongfun.setHDData(uid, hdinfo['hdid'], _setData)



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a