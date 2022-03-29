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
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,num,rechargetime')
    # 不是同一天就清除之前得充值
    _nt = g.C.NOW()
    if g.C.DATE(_nt) != g.C.DATE(hdData.get('rechargetime', _nt)):
        hdData['num'] = 0
        g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'],{'num': 0})

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _day = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        # 索引越界
        if _day - 1 >= len(hdinfo['data']['arr']):
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        if _day in hdData.get('gotarr', []):
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        if _day not in hdData['val']:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": _day}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, hdinfo["data"]['arr'][_day - 1],
                                  {"act": "hdgetprize", "hdid": hdid, "val": _day, "prize": hdinfo["data"]['arr'][_day - 1]})
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
    if set(_valInfo['val']) ^ set(_valInfo['gotarr']):
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

    setData = {"$set": {"gotarr": [],'num':0,'val':[]}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return
    _num = args[2]['unitPrice'] // 100
    _data = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,num,rechargetime')
    _nt = g.C.NOW()
    # 同一天
    if g.C.DATE(_nt) == g.C.DATE(_data.get('rechargetime', _nt)):
        _data['num'] += _num
    else:
        _data['num'] = _num

    # 条件满足  激活领取条件  并且
    if _data['num'] >= hdinfo['data']['val'] and g.C.getDateDiff(hdinfo['stime'], _nt)+1 not in _data['val']:
        _data['val'].append(g.C.getDateDiff(hdinfo['stime'], _nt) + 1)

    g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'], {'rechargetime':_nt,'num':_data['num'],'val':_data['val']})





if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 3200
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = hdEvent(uid, hdidinfo,'chongzhi',1,1,{'unitPrice': 500000})
    # a = getPrize(uid, hdidinfo,idx=1,act=1)
    # a = getOpenData(uid, hdidinfo)
    a = getHongdian(uid, hdid, hdidinfo)
    print a