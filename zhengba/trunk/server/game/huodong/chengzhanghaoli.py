#! /usr/bin/python
# -*-coding:utf-8-*-

htype = 27
import sys
if __name__ == "__main__":
    sys.path.append("..")
import g


def getOpenList(uid, hdinfo):
    return  hdinfo
    gud = g.getGud(uid)
    # if gud['lv'] < 10:
    #     return None
    hdid = hdinfo['hdid']
    _gud = hdinfo['data']['showcond'][0]
    _cond = hdinfo['data']['showcond'][1]

    # 检查显示条件
    if 'showcond' in hdinfo['data'] and gud[_gud] < _cond:
        return None

    # 奖励领取完了不显示
    myhddata = g.mdb.find('hddata',{'uid':uid,'hdid':hdid})
    if 'gotarr' in myhddata and len(hdinfo['data']['arr']) + 1 == len(myhddata['gotarr']):
        return None

    return hdinfo

if __name__ == '__main__':
    uid = g.buid('xuzhao1')
    _info = g.GC['huodong1']
    print getOpenList(uid, _info)


def getOpenData(uid, hdinfo):
    gud = g.gud.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']
    _myInfo = g.huodong.getHDData(uid, hdid)
    if not _myInfo:
        _myInfo = {
            'val': gud["lv"],
            'gotarr': []
        }
        g.huodong.setHDData(uid, hdid, _myInfo)
    else:
        if _myInfo["val"] < gud["lv"]:
            _myInfo["val"] = gud["lv"]
            _r = g.huodong.setHDData(uid, hdid, {"val":gud["lv"]})

    _valInfo = {}
    _valInfo['info'] = hddata
    _valInfo["myinfo"] = _myInfo
    return _valInfo


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']

    hdInfo = g.huodong.getInfo(hdid)
    _hdData = g.huodong.getHuodongInfoById(hdid, keys='_id,htype,data,rtime', iscache=0)
    _valInfo = g.huodong.getHDData(uid, hdid)
    _con = _hdData["data"]["arr"][idx]
    #动作 1领取，2购买
    if int(act) == 2:
        _rData = onBuy(uid,hdid,_hdData,_valInfo)
        return _rData

    idxStr = str(idx)
    _hdMainData = getOpenData(uid, hdinfo)
    _hdData = g.huodong.getHuodongInfoById(hdid, keys='_id,htype,data,rtime', iscache=0)

    # 1领取
    if int(act) == 1:
        if _con["val"] in _hdMainData['myinfo']['gotarr']:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        # 还没有购买不能领取
        _chkRes = checkData(uid, hdid, idx, _hdData, _valInfo)
        if _chkRes[0] != True:
            _res = {"s": -2, "errmsg": g.L(_chkRes[1])}
            return _res

        # _con = _hdData["data"]["arr"][idx]
        _r = g.huodong.setHDData(uid, hdid, {"$push": {"gotarr": _con["val"]}})

        gud = g.gud.getGud(uid)
        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}, 'hunshi': {}, 'hunshi': {}}

        # g.chat.sendMsg(_msg, 1)
        _prizeMap = g.base.getPrizeRes(uid, _con["p"],
                                  {"act": "hdgetprize", "hdid": hdid, "val": _con["val"], "prize": _con["p"]})
        for k, v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _rData["cinfo"] = _changeInfo
        _rData["myinfo"] = g.huodong.getHDData(uid, hdid)

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

# 检查是否已购买活动
def checkData(uid,hdid,idx,hddata,valinfo):
    _retVal = (True,)
    # 未购买
    if -1 not in valinfo["gotarr"]:
        _retVal = (False, "hd_czjh_notbuy")

    _needLv = hddata['data']['arr'][idx]['val']
    gud = g.gud.getGud(uid)
    if int(gud['lv']) < _needLv:
        _retVal = (False, "hd_czjh_lvless")

    return _retVal

def onBuy(uid,hdid,hddata,valinfo):
    _hdData = hddata
    _valInfo = valinfo
    _res = {}
    # 可购买成长计划
    if "buyneed" in _hdData["data"]:
        # 未购买过
        if -1 not in _valInfo["gotarr"]:
            _tmpGud = g.gud.getGud(uid)

            if int(_hdData['htype']) not in (26, 27):
                # VIP4才能买
                if _tmpGud["vip"] < 4:
                    _res = {"s": -2, "errmsg": g.L("huodonguse_act2_res_-2", 4)}
                    return _res

            else:
                _key, _value = _hdData['data']['buycond']
                if _tmpGud[_key] < _value:
                    _res = {"s": -3, "errmsg": g.L("huodonguse_act2_res_-2", _value)}
                    return _res

            _needMap = {_hdData["data"]["buyneed"]["t"]: -_hdData["data"]["buyneed"]["n"]}
            _altRes = g.user.altNum(uid, _needMap)
            # 消耗不足
            if _altRes[0] != True:
                _res = {"s": -100, "attr": _altRes[1]}
                return _res

            # 扣除消耗
            _r = g.user.updateUserInfo(uid, _needMap, {"act": "hdbuyczjh", "hdid": hdid})
            # 设置已激活成长计划
            gud = g.gud.getGud(uid)
            # _r = g.huodong.setMyHuodongData(uid, hdid, {"$push": {"gotarr": -1}, "val": gud["lv"]})
            _r = g.huodong.setHDData(uid, hdid, {"$push": {"gotarr": -1}})
            _res = {"myinfo": {"val": gud["lv"], "gotarr": _valInfo["gotarr"] + [-1]}, "cinfo": {"attr": _needMap}}

        else:
            _res = {"s": -1, "errmsg": g.L("huodonguse_act2_res_-4")}
            return _res

    return (_res)

def getHongdian(uid, hdid, hdinfo):
    # 活动先购买 达到级数且没有领取奖励
    val = False
    _valInfo = getOpenData(uid, hdinfo)
    _valInfo = _valInfo['myinfo']
    gud = g.gud.getGud(uid)
    g_lv = gud['lv']
    hdarr = hdinfo['data']['arr']
    notgetarr = False
    for arr in hdarr:
        if arr['val'] <= g_lv and arr['val'] not in _valInfo["gotarr"]:
            notgetarr = True
            break

    # 已经购买 达到指定等级 没有领取
    if -1 in _valInfo["gotarr"] and notgetarr:
        val = True

    return val


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    pass