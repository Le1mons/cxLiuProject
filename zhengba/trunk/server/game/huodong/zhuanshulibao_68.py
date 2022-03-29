#! /usr/bin/python
# -*-coding:utf-8-*-


"""
专属礼包
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 68
import g



def getOpenList(uid, hdinfo):
    # if hdinfo['isxianshi'] == 1:
    #     hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    #     for idx, i in enumerate(hdinfo['data']):
    #         if hdData['gotarr'].get(str(idx), 0) < hdinfo['data'][idx]['maxnum']:
    #             break
    #     else:
    #         return False
    return


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    if hdData["lasttime"] < _zt:
        gud = g.getGud(uid)
        _vip = gud["vip"]
        # 设置今天的vip等级
        g.m.huodongfun.setHDData(uid, hdid, {"val": _vip})
        hdData["val"] = _vip

    _libaoList = hdinfo["data"]
    _fmtData = []
    for libao  in _libaoList:
        if hdData["gotarr"].get(libao["proid"], 0) >= libao["maxnum"]:
            continue
        if libao["viparea"][0] <= hdData["val"] <= libao["viparea"][1]:
            _fmtData.append(libao)
    hdinfo["data"] = _fmtData

    # 设置玩家点开功能的次数
    g.m.huodongfun.setHDData(uid, hdid, {"$inc":{"click": 1}})

    _retVal = {"info":hdinfo,"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    pass


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    gud = g.getGud(uid)

    setData = {"$set": {"gotarr": {}, "val": gud["vip"]}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    return
    if etype != 'chongzhi':
        # 只处理充值事件
        return

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _val = hdData["val"]
    if hdData["lasttime"] < _zt:
        gud = g.getGud(uid)
        _vip = gud["vip"]
        # 设置今天的vip等级
        g.m.huodongfun.setHDData(uid, hdid, {"val": _vip})
        _val = _vip

    for idx, i in enumerate(hdinfo['data']):
        if i['proid'] != args[2]['proid']:
            continue
        if hdData['gotarr'].get(str(idx), 0) >= i['maxnum']:
            g.success[kwargs['orderid']] = False
            return
        # 判断当前vip是否可以购买
        if not (i["viparea"][0] <= _val <= i["viparea"][1]):
            return

        _prize = i['prize']
        _send = g.getPrizeRes(uid, _prize, {'act': 'zhuanshulibao', 'proid':i['proid']})
        g.sendUidChangeInfo(uid, _send)
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'$inc': {'gotarr.{}'.format(idx): 1}})
        break


def isOpen(uid):
    _res = {}
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    # 判断活动是否开启
    if not _hdinfo:
        return _res

    _hd = getOpenData(uid, _hdinfo)
    # 判断是否有礼包可以购买
    if not _hd["info"]["data"]:
        return _res

    _res["act"] = 1
    _res["hdid"] = _hdinfo["hdid"]
    # _res["rtime"] = _hdinfo["rtime"]
    return _res





if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a