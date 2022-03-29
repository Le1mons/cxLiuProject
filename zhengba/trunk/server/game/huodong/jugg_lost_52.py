#! /usr/bin/python
# -*-coding:utf-8-*-


"""
剑圣迷踪
"""

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 52
import g


def getOpenList(uid, hdinfo):

    hdData = todayReset(uid, hdinfo)
    # 判断你是否开启
    if not isopen(uid, hdData, hdinfo):
        return

    return hdinfo


def getOpenData(uid, hdinfo):
    # 隔天重置
    hdData = todayReset(uid, hdinfo)
    _retVal = {"info": hdinfo["data"], "myinfo": hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    _hdData = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _prize = hdinfo["data"]["arr"][idx]

    # 1领取
    if int(act) == 1:
        if str(idx) not in _hdData['gotarr'] or _hdData['gotarr'][str(idx)] == 1:
            # 参数错误
            _res['s'] = -1
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        # # 判断是否达到领取条件
        # if hdinfo["data"]["val"] > _hdData["val"]:
        #     # 已经领取过奖励
        #     _res['s'] = -2
        #     _res['errmsg'] = g.L('huodong_denglulingjiang_res_-1')

        _key = g.C.STR("gotarr.{1}", idx)
        _r = g.m.huodongfun.setMyHuodongData(uid, hdid,  {_key: 1})

        _changeInfo = {"item": {}, "attr": {}, "hero": {}}

        _prizeMap = g.getPrizeRes(uid, _prize,
                                  {"act": "hdgetprize", "hdid": hdid, "prize": _prize})
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
        _rData["prize"] = _prize
        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res


# 生成玩家初始活动数据
def initHdData(uid,hdid,data=None,*args,**kwargs):
    hdInfo = g.m.huodongfun.getInfo(hdid, keys='_id,data')
    _arr = hdInfo["data"]["arr"]
    # 默认初始有个奖励
    _gotArr = {"0": 0}
    # for idx, v in enumerate(_arr):
    #     _gotArr[str(idx)] = 0
    setData = {'gotarr': _gotArr, 'val': 0, 'lasttime': g.C.NOW(), "idx": 1}
    g.m.huodongfun.setHDData(uid, int(hdid), setData)
    return setData


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return 0

    _money = int(args[1])
    hdid = hdinfo["hdid"]


    # 隔天重置
    hdData = todayReset(uid, hdinfo)
    # 判断你是否开启
    if not isopen(uid, hdData, hdinfo):
        print 'jugg_lost_chongzhi************************'
        print uid,hdid,hdData
        return

    _needVal = hdinfo["data"]["needval"]
    hdData["val"] += _money
    _setData = {'$inc': {'val': _money}}
    _idx = hdData["idx"]
    # 判断是否满足领取条件，如果满足直接生成可领取的数据
    if _needVal <= hdData["val"] and hdData['gotarr'].get(str(_idx),0) != 1:
        _setData["$set"] = {}
        _key = g.C.STR("gotarr.{1}", _idx)
        _setData["$set"][_key] = 0

    g.m.huodongfun.setHDData(uid, int(hdid), _setData)


# 红点
def getHongdian(uid, hdid, hdinfo):

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime,idx,finish')
    if not isopen(uid, hdData, hdinfo):
        return False

    for k, v in hdData["gotarr"].items():
        if v == 0:
            return True
    return False


# 隔天重置
def todayReset(uid, hdinfo):
    _hdid = hdinfo["hdid"]
    # 获取当前充值得数据
    hddata = g.m.huodongfun.getMyHuodongData(uid, _hdid, keys='_id,val,gotarr,lasttime,idx,finish,hdid')
    _lasttime = hddata["lasttime"]
    if hddata.get("finish", 0):
        return hddata

    # 生成当天零点事件
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    if _lasttime < _zt:
        _recPrize = hddata["gotarr"]
        if len(hdinfo["data"]["arr"]) <= len(_recPrize):
            g.m.huodongfun.setMyHuodongData(uid, _hdid, {"finish": 1})
            return {"finish": 1}
        # 生成当前任务的idx
        idx = 1
        # 如果有数据就加1
        if len(_recPrize) > 0:
            _recPrize = [int(i) for i in _recPrize]
            idx = max(_recPrize) + 1
            if idx >= len(hdinfo["data"]["arr"]):
                idx = len(hdinfo["data"]["arr"]) - 1
        _setData = {}
        _setData["idx"] = idx
        _setData["val"] = 0
        # 设置
        g.m.huodongfun.setMyHuodongData(uid, _hdid, _setData)
        hddata["idx"] = idx
        hddata["val"] = 0
    return hddata


# # 如果有未领取的奖励就发奖
# def sendPrize(uid, con, hddata):
#     _prize = []
#     _recPrize = hddata["gotarr"]
#     # 筛选出没有领取的奖励
#     _recIdx = [int(i) for i in _recPrize if _recPrize[i]]
#     for i in _recIdx:
#         _recPrize[str(i)] = 1
#         _prize += con[i]
#     # 如果有奖励没有领取就发邮件给玩家
#     if _prize:
#         _title = con["title"]
#         _content = con["content"]
#         # 发送奖励
#         g.m.emailfun.sendEmail(uid, 1, _title, _content, _prize)
#         # 设置
#         g.m.huodongfun.setMyHuodongData(uid, hddata["hdid"], {"gotarr": _recPrize})



# 定时器
def timer_sengPrize():
    _nt = g.C.NOW()
    hdwhere = {}
    hdwhere["htype"] = htype
    hdwhere['stime'] = {'$lte': _nt}  # 开始时间小于现在
    hdwhere['$or'] = [{'etime': {'$gte': _nt}}, {'etime': 0}]  # 结束时间大于现在或者为0
    # 获取活动列表
    _hdinfo = g.mdb.find("hdinfo", hdwhere, fields=["_id"])
    for info in _hdinfo:
        _hdid = info["hdid"]
        _alldata = g.mdb.find("hddata", {"hdid": _hdid, "finish": {"$exists": 0}}, fields=["_id"])
        for d in _alldata:
            if d.get("finish", 0):
                continue
            _prize = []
            _recPrize = d["gotarr"]
            uid = d["uid"]
            # 筛选出没有领取的奖励
            for i in _recPrize:
                if _recPrize[str(i)] or str(i) == "0":
                    continue
                _recPrize[str(i)] = 1
                _prize += info["data"]["arr"][int(i)]
            # 如果有奖励没有领取就发邮件给玩家
            if _prize:
                _title = info["data"]["title"]
                _content = info["data"]["content"]
                # 发送奖励
                g.m.emailfun.sendEmail(uid, 1, _title, _content, _prize)
                # 设置
                g.mdb.update("hddata", {"hdid": _hdid, "uid": uid}, {"gotarr": _recPrize})




# 判断是否开启
def isopen(uid, hddata, hdinfo):
    _day = g.getOpenDay()
    # 开服7天后显示
    if _day <= hdinfo["data"]["openday"]:
        return 0

    if hdinfo["data"]["fronthdid"] == -1:
        if hddata.get("finish", 0):
            return 0
        else:
            return 1
    else:
        _fronthdid = hdinfo["data"]["fronthdid"]
        _fronthdinfo = g.m.huodongfun.getHuodongInfo(where={"hdid": _fronthdid})
        # 判断前面的活动有没有完成
        _fronthhdData = todayReset(uid, _fronthdinfo[0])
        if _fronthhdData.get("finish", 0) and not hddata.get("finish", 0):
            return 1

    return 0


if __name__ == "__main__":
    uid = g.buid("liu1")
    # hdid = 50
    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    hdEvent('28670_5dea8223fb1f0f45fd061c1f',g.mdb.find1('hdinfo',{'hdid':5202}),'chongzhi',1,10)