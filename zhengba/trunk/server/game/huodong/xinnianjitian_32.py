#! /usr/bin/python
# -*-coding:utf-8-*-


"""
新年积天
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 32
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,num,rechargetime,day')
    # 不是同一天就清除之前得充值
    _nt = g.C.NOW()
    if g.C.DATE(_nt) != g.C.DATE(hdData.get('rechargetime', _nt)):
        hdData['num'] = 0
        hdData["day"] += 1
        g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'], {'num': 0, "day": hdData["day"]})

    _retVal = {"info": hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _day = abs(int(kwargs['idx']))
    act = kwargs['act']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,num')

    # 1领取
    if int(act) == 1:
        # 索引越界
        if _day > len(hdinfo['data']['arr']):
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        if _day in hdData.get('gotarr', []):
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        # 充值金额不足
        if hdData['val'] < _day:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": _day}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, hdinfo["data"]['arr'][_day - 1]['p'],
                                  {"act": "hdgetprize", "hdid": hdid, "val": _day})
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
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if _valInfo['val'] == 0:
        return _retVal

    _nt = g.C.NOW()
    # 充值金额满足某一档
    for i in xrange(1, _valInfo['val'] + 1):
        if i not in _valInfo['gotarr']:
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

    setData = {"$set": {"gotarr": [],'num':0,'val':0, "day": 1}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return
    _nt = g.C.NOW()
    # 活动结束
    if _nt >= hdinfo['rtime']:
        return

    _num = args[2]['unitPrice'] // 100
    _data = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,num,rechargetime')

    _setData = {}
    # 同一天并且充值金额已经大于了60
    if (g.C.DATE(_nt) == g.C.DATE(_data.get('rechargetime', _nt)) and _data['num'] >= hdinfo['data']['val']):
        _setData['num'] = _data['num'] + _num
    # 同一天  但是充值金额不足
    elif g.C.DATE(_nt) == g.C.DATE(_data.get('rechargetime', _nt)):
        _setData['num'] = _data['num'] + _num
        # 条件满足  激活领取条件
        if _setData['num'] >= hdinfo['data']['val']:
            _setData['val'] = _data['val'] + 1

    else:
        _setData['num'] = _num
        # 条件满足  激活领取条件
        if _setData['num'] >= hdinfo['data']['val']:
            _setData['val'] = _data['val'] + 1

    _setData['rechargetime'] = _nt
    g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'], _setData)





if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 3200
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = hdEvent(uid, hdidinfo,'chongzhi',1,1,{'unitPrice': 500000})
    # a = getPrize(uid, hdidinfo,idx=1,act=1)
    # a = getOpenData(uid, hdidinfo)
    a = getHongdian(uid, hdid, hdidinfo)
    print a