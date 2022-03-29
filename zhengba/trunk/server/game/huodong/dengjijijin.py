#! /usr/bin/python
# -*-coding:utf-8-*-

htype = 4
if __name__ == '__main__':
    import sys
    sys.path.append('game')
    sys.path.append('..')

import g


"""
等级基金-4
"""
# 获取活动界面列表
def getOpenList(uid, hdinfo):

    return hdinfo

# 获取活动界面数据
def getOpenData(uid, hdinfo):
    gud = g.gud.get(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']
    _myInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,rec')
    if not _myInfo:
        _myInfo = {
            'val': gud["lv"],
            'gotarr': []
        }
        g.m.huodongfun.setHDData(uid, hdid, _myInfo)
    else:
        if _myInfo["val"] < gud["lv"]:
            _myInfo["val"] = gud["lv"]
            _r = g.m.huodongfun.setHDData(uid, hdid, {"val":gud["lv"]})

    _valInfo = {}
    _valInfo['info'] = hddata
    _valInfo["myinfo"] = _myInfo
    return _valInfo

# 获取活动奖励
def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    gud = g.gud.get(uid)

    _hdData = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _con = hdinfo["data"]["arr"][idx]

    # 1领取
    if int(act) == 1:
        # 等级不足
        if gud['lv'] < _con['val']:
            _res = {"s": -3, "errmsg": g.L('dengjijijin_res_-3')}
            return _res

        _set = {'$push': {}}
        _prize = []
        # 免费得
        if _con["val"] not in _hdData.get('rec', []):
            _prize += _con['free']
            _set['$push']['rec'] = _con["val"]

        if -1 in _hdData.get('gotarr', []) and _con["val"] not in _hdData['gotarr']:
            _prize += _con['p']
            _set['$push']['gotarr'] = _con["val"]

        if not _prize:
            # 已经领取过奖励
            _res['s'] = -2
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _r = g.m.huodongfun.setMyHuodongData(uid, hdid, _set)
        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, _prize,
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
        _rData["prize"] = _prize
        _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

# 活动红点
def getHongdian(uid, hdid, hdinfo):
    # 活动先购买 达到级数且没有领取奖励
    val = False
    _valInfo = getOpenData(uid, hdinfo)
    _valInfo = _valInfo['myinfo']
    gud = g.gud.get(uid)
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

# 活动初始化
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
    _myInfo = {
        'val': gud["lv"],
        'gotarr': [],
        'rec': []
    }
    if data:
        _myInfo.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), _myInfo)


# 活动事件
def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0
    hdid = hdinfo['hdid']
    val = g.m.huodongfun.getHDData(uid, hdid)
    payCon = args[2]
    if payCon['proid'] != 'djjj128':
        return

    hdid = hdinfo['hdid']
    # 购买过不能继续进行购买
    if -1 in val["gotarr"]:
        return

    g.m.huodongfun.setMyHuodongData(uid, hdid, {"$push": {"gotarr": -1}})

# 检查等级基金是否全部领取完
def chkLvFundOver(uid):
    _res = 0
    _info = g.mdb.find1('hdinfo', {'htype': htype},fields=['_id','hdid','data'])
    if _info:
        _hdData = g.m.huodongfun.getMyHuodongData(uid, _info['hdid'])
        if len(_info['data']['arr']) == len(_hdData['gotarr']) - 1 == len(_hdData.get('rec', [])):
            _res = 1
    return _res

if __name__ == '__main__':
    chkLvFundOver(g.buid('hkl123'))