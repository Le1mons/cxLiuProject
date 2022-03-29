#! /usr/bin/python
# -*-coding:utf-8-*-

# 终极礼包



htype = 56
import g



def getOpenList(uid, hdinfo):
    if hdinfo['isxianshi'] == 0:
        return hdinfo
    # 如果是新手礼包就不在活动列表显示，特殊处理！
    _myInfo = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,lasttime')
    for i in _myInfo['val']:
        if i['num'] > 0:
            break
    else:
        return False
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    _myInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    retVal = {"info": hdinfo["data"], "myinfo": _myInfo}
    return retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    pass


def getHongdian(uid, hdid, hdinfo):
   pass


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0
    _proid = args[0]
    _money = int(args[1])
    _payCon = args[2]
    # 获取活动id
    _hdid = hdinfo["hdid"]
    # 获取活动列表
    _arrlist = hdinfo["data"]["arr"]
    unitPrice = _payCon.get('unitPrice', 0)
    # 循环获取领取的活动下标
    _idx = -1
    for i, val in enumerate(_arrlist):
        if _proid == val["payinfo"]["proid"]:
            _idx = i
            break
    # 如果活动中没有对应的proid,就不处理
    if _idx == -1:
        return

    # 获取玩家的活动数据
    _hdData = g.m.huodongfun.getHDData(uid, _hdid, keys='_id,val,gotarr')

    # 判断玩家是否购买过这个道具,
    _val = _hdData["val"]
    # 如果已经购买过了。就直接返回
    _maxNum = hdinfo["data"]["arr"][_idx]["buymaxnum"]
    for idx, val in enumerate(_hdData['val']):
        if _arrlist[idx]["payinfo"]["proid"] == _proid:
            if val['num'] > 0:
                val['num'] -= 1
                # 发奖
                prizeMap = g.getPrizeRes(uid, val["prize"],{"act": "hdgetprize", "hdid": _hdid, "val": val["val"]})
                g.sendUidChangeInfo(uid, prizeMap)
                break

    g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'val': _hdData['val']})

    # _key = g.C.STR("gotarr.{1}", str(_idx))
    # _setData = {}
    # _setData["$inc"] = {}
    # _setData["$inc"]["val"] = _money
    # _setData["$inc"][_key] = 1
    # # 更新数据库
    # g.m.huodongfun.setHDData(uid, _hdid, _setData)
    # # 获取本次奖励
    # _prize = hdinfo["data"]["arr"][_idx]["prize"]
    # _changeInfo = g.getPrizeRes(uid, _prize, {'act': 'zhongjilibao_{0}'.format(_proid)})
    # # 通知客户端
    # g.sendUidChangeInfo(uid, _changeInfo)



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
            'val': arr["payinfo"]["unitprice"],
            'num': arr['buymaxnum'],
            'prize': arr['prize']
        }
        valList.append(valDict)
    setData = {'gotarr': [], 'val': valList, 'lasttime': g.C.NOW()}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


# 判断是否活动是否还显示
def isShow(uid, hdinfo):
    _res = 0
    _hdid = hdinfo["hdid"]
    _hdData = getOpenData(uid, hdinfo)
    # 获取活动列表
    _arrlist = hdinfo["data"]["arr"]
    _val = _hdData["myinfo"]["val"]
    # 循环判断是否所有礼包已经购买完成
    for v in _val:
        # 当前购买的次数
        _num = v["num"]
        if _num > 0:
            _res = 1
            break
    return _res


# 判断是否开启
def isOpen(uid):
    _res = {"act": 0}
    gud = g.getGud(uid)
    _vip = gud["vip"]
    # # vip大于2才显示
    # if _vip < 2:
    #     return _res
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"hdid": 1988, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}})
    if not _hdinfo:
        return _res

    _hdData = getOpenData(uid, _hdinfo)
    # 获取活动列表
    _arrlist = _hdinfo["data"]["arr"]
    _val = _hdData["myinfo"]["val"]
    # 循环判断是否所有礼包已经购买完成
    for v in _val:
        # 当前购买的次数
        _num = v["num"]
        if _num > 0:
            _res["act"] = 1
            break
    return _res


