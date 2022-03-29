#! /usr/bin/python
# -*-coding:utf-8-*-


"""
超值礼包
stype = 10006
活动期间 多少钱购买相应礼包获得，获得奖励物品，礼包有限购次数和重置类型，重置类型控制是否每天重置购买次数

::


    "data": {
      "show": "超值礼包",
      "btn": "领 取",
      "buymaxnum":3,
      "isreset":1,
      "arr": [
        {
          "val": 64800,
          "p": [
            {
              "a": "attr",
              "t": "jinbi",
              "n": 120000
            }
          ]

        },
        {
          "val": 32800,
          "p": [
            {
              "a": "attr",
              "t": "jinbi",
              "n": 120000
            }
          ]
        }

      ]
    }

"""



htype = 12
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    """
    有重置的礼包要重置礼包购买次数

    :param uid:
    :param hdinfo:
    :return:
    """
    gud = g.getGud(uid)
    hdInfoData = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')

    # 判断是否是重置类型 isreset=1
    isreset = hdInfoData.get('isreset',0)
    nt = g.C.NOW()
    if isreset:
        # 是否是同一天
        if not g.C.chkSameDate(nt, int(hdData["lasttime"])):
            # buyMaxNum = hdInfoData['buymaxnum']
            # hdDataVal = hdData['val']
            # valList = []
            # for arr in hdDataVal:
            #     arr['num'] = buyMaxNum
            #     valList.append(arr)
            for ele in hdInfoData['arr']:
                ele['num'] = ele['buymaxnum']
                del ele['buymaxnum']
            g.m.huodongfun.setHDData(uid,hdid,{'val':hdInfoData['arr']})
            hdData['val'] = hdInfoData['arr']

    #该活动没有任何值时的特殊处理
    if hdData == None:hdData = {"val":[],"gotarr":[]}
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


# 没有领奖 直接事件发送奖励
# remove
def getPrize(uid, hdinfo, *args, **kwargs):
    return

    """_res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    hdDataArr = hdinfo['data']['arr'][idx]
    # hdDataArr = _hdData["data"]["arr"][idx]

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 1领取
    if int(act) == 1:
        if hdDataArr["val"] in hdData['gotarr']:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res


        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": hdDataArr["val"]}})

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
        return _res"""


def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt < hdinfo['rtime']:
        return _retVal

    # 已领取
    if len(_valInfo['gotarr']) > 0:
        return _retVal

    # 充值金额满足某一档
    for ele in _valInfo['arr']:
        if _valInfo['val'] >= ele['val']:
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
    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data', iscache=0)
    hdInfoData = hdInfo['data']
    valList = []
    for arr in hdInfoData['arr']:
        # 购买的钱 分
        valDict = {
            'val': arr['val'],
            'num': arr['buymaxnum'],
            'p':arr['p'],
            'prize':arr['prize']
        }
        valList.append(valDict)
    setData = {'gotarr': [],'val':valList,'lasttime':g.C.NOW()}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    """
    活动监听 在 ``api_chongzhi_pay`` 中加入 ``g.m.huodongfun.event(uid,'12',proid=proid,unitPrice=unitPrice)``

    :param uid:
    :param hdinfo:
    :param etype:
    :param args:
    :param kwargs:
    :return:
    """
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0

    # 取出proid配置
    proidList = []
    for ele in hdinfo['data']['arr']:
        proidList.append(ele['payinfo']['proid'])

    # 充值配置
    payCon = args[2]
    if payCon['proid'] not in proidList:
        return 0


    hdid = hdinfo['hdid']
    unitPrice = payCon.get('unitPrice',0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    for val in hdData['val']:
        if val['val'] == unitPrice:
            if val['num'] > 0:
                val['num'] -= 1
                # 发奖
                prizeMap = g.getPrizeRes(uid, val["prize"],{"act": "hdgetprize", "hdid": hdid, "val": val["val"], "prize": val["p"]})
                g.sendUidChangeInfo(uid, prizeMap)
                break


    g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'val':hdData['val']})



if __name__ == "__main__":
    uid = g.buid("liu200")
    hdid = 1200
    a = hdEvent(uid,{'hdid':hdid},'12',unitPrice=32800)

    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    print a