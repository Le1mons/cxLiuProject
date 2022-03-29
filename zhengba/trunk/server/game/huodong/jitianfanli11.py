#! /usr/bin/python
# -*-coding:utf-8-*-

htype = 11
import g

"""
积天返利 11
stype = 10005

etime 倒计时结束时间 用于前段显示

间隔累计 一天累计一次

"""

def getOpenList(uid, hdinfo):
    return hdinfo

def getOpenData(uid, hdinfo):

    gud = g.getGud(uid)
    hdInfoData = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid,keys='_id,data,intr,htype,rtime,ttype,resdata,etime',iscache=0)

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 没有数据生成初始数据
    if hdData == None:
        hdData = {"val":0,"gotarr":[]}
        initHdData(uid,hdid)
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

    _hdData = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,htype,data,rtime', iscache=0)
    #获取配置
    _con = _hdData["data"]["arr"][idx]

    idxStr = str(idx)

    # 1领取
    if int(act) == 1:

        _res = {}
        _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys="_id,gotarr,val,lessnum,usenum")
        if "gotarr" not in _valInfo:
            _valInfo["gotarr"] = []

        if idx < 0 or idx >= len(_hdData["data"]["arr"]):
            _res = {"s": -1, "errmsg": g.L("global_nohuodongidx")}
            return (_res)

        # 已领取过该活动奖励
        if _con["val"] in _valInfo["gotarr"]:
            _res = {"s": -3, "errmsg": g.L("global_algetprize")}
            return (_res)

        #val不满足,无法领取/购买
        if _con["val"] > _valInfo["val"]:
            _res = {"s":-2,"errmsg":g.L("global_nohuodongcond")}
            return _res

        # 有领取消耗
        _needMap = {}
        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}, 'hunshi': {}}

        _rData = {"myinfo":{"gotarr":_valInfo["gotarr"] + [_con["val"]]}}
        #记录已领取的状态
        _r = g.m.huodongfun.setMyHuodongData(uid, hdid, {"$push":{"gotarr":_con["val"]}})
        g.m.huodongfun.analysisData(uid, hdid,"tier"+str(_con["val"]), 1)


        _prizeMap = g.getPrizeRes(uid, _con["p"],
                                  {"act": "hdgetprize", "hdid": hdid, "val": _con["val"], "prize": _con["p"]})

        for k, v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _rData['cinfo'] = _changeInfo
        return _rData

    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

#活动数据统计，用于在gameconfig后台统计活动参与度数据
def analysisData(uid,hdid,k,addVal):
    # _r = setMyHuodongData(uid, hdid, {"$inc":{"analy."+str(k) :addVal}})
    _r = g.m.huodongfun.setHDData(uid, hdid, {"$inc":{"analy."+str(k) :addVal}})
    return _r


def initHdData(uid,hdid,data=None,*args,**kwargs):
    """
    初始活动数据
    :param uid:
    :param hdid: int
    :return:
    """

    setData = {"$inc": {"val": 0}, "$set": {"gotarr": [],'rechargetime':g.C.NOW()}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)



def resetHDInfo(htype):
    """
    重新设置积天返利活动

    :param uid:
    :return:
    """

    # hdinfo = g.mdb.find1('hdinfo', {'htype': htype}, fields=['_id', 'hdid', 'etime','stime','rtime','htype'])

    nt = g.C.NOW()
    # stime = hdinfo['stime']
    # etime = hdinfo['etime']
    settime = nt + 14 * 60 * 60 * 24
    setdata = {
        'stime': nt,
        'etime': settime,
        'rtime': settime,
        'hdid': nt
    }
    g.mdb.update('hdinfo',{'htype': htype}, setdata)

    res = g.mdb.find1('hdinfo', {'htype': htype})

    return res




def getHongdian(uid, hdid, hdinfo):
    _retVal = 0
    # _hdInfo = g.m.huodongfun.getInfo(hdid)
    # # 如果活动未上架
    # if not _hdInfo:
    #     return _retVal
    # _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # hdarr = _hdInfo["data"]["arr"]
    #
    # for arr in hdarr:
    #     if _valInfo['val'] >= arr['val'] and arr['val'] not in _valInfo.get("gotarr", []):
    #         _retVal = 1
    #         break

    return _retVal

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0

    _zt = g.C.NOW(g.C.DATE())
    hdid = hdinfo['hdid']
    # money = int(args[2]['rmbmoney'])
    lejirmbmoney = hdinfo['data']['needmoney']
    payCon = args[2]
    if payCon['unitPrice'] >= lejirmbmoney:  # 6元以下的不计入累充

        nt = g.C.NOW()
        zt = g.C.ZERO(nt)

        # 获取我的活动信息
        myHdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo["hdid"], keys='_id,rechargetime,val,lasttime')
        mylastimezt = g.C.ZERO(myHdData.get('rechargetime',myHdData['lasttime'] ))
        # 当天不在累计
        if zt == mylastimezt and myHdData['val'] != 0:
            return 0
        r = g.m.huodongfun.setMyHuodongData(uid, int(hdinfo["hdid"]), {"$inc": {"val": 1},'$set':{'rechargetime':nt}})
