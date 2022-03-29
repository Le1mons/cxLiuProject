#! /usr/bin/python
# -*-coding:utf-8-*-


"""
皮肤商城
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 64
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = int(kwargs['act'])
    hdid = hdinfo['hdid']

    hdDataArr = hdinfo['data']['arr'][act]

    if idx >= len(hdDataArr['p']):
        # 已经领取过奖励
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _r = g.m.huodongfun.setHDData(uid, hdid, {"val.{}".format(act): idx})
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

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

    setData = {"val": {},"gotarr": {}}
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return

    _proid = args[0]
    for idx,i in enumerate(hdinfo['data']['arr']):
        if _proid == i['proid']:
            break
    else:
        return

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    # 还没有选择
    if str(idx) not in hdData['val']:
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {"meiyouxuan": _proid})
        return

    _prize = hdinfo['data']['arr'][idx]['p'][hdData['val'][str(idx)]]
    _send = g.getPrizeRes(uid, _prize, {'act':'skinstore'})
    g.sendUidChangeInfo(uid, _send)




if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a