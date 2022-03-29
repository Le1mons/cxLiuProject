#! /usr/bin/python
# -*-coding:utf-8-*-

"""
返利红包 消费返还


::

    {
        "s": 1,
        "d": {
            "info": {
                "reset": -1,
                "zhekou": 25,
                "mode": "xiaofei",
                "fanli": [
                    [
                        0,
                        30
                    ],
                    [
                        1,
                        50
                    ],
                    [
                        5,
                        75
                    ],
                    [
                        6,
                        100
                    ]
                ]
            },
            "myinfo": {
                "daynum": "3",              # 天数
                "gotarr": [],
                "sum": 43774,               # 总数
                "finish": 0,                # 是否完成
                "val": {
                    "1": 25491,
                    "3": 136,
                    "2": 18147
                }
            }
        }
    }




"""


htype = 20
import g



def getOpenList(uid, hdinfo):
    gud = g.getGud(uid)

    # if gud['lv'] < 10:
    #     return None

    hdid = hdinfo['hdid']

    return hdinfo


def getOpenData(uid, hdinfo):
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']
    _myInfo = g.m.huodongfun.getMyHuodongData(uid, hdid,keys='finish,vip,val,_id')
    _valInfo = {}
    _valInfo['info'] = hddata
    _valInfo["myinfo"] = _myInfo

    _sum = sum(_myInfo['val'].values())
    _valInfo['sum'] = _sum

    _valInfo['daynum'] = getDayNum(hdinfo)

    return _valInfo


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']

    #动作 1领取
    valiinfo = getOpenData(uid, hdinfo)

    # 1领取
    if int(act) == 1:
        nt = g.C.NOW()

        if not hdinfo['rtime'] < nt < hdinfo['etime']:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_nohuodong')
            return _res

        if valiinfo['myinfo'].get('finish',0) == 1:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_noprize')
            return _res

        gud = g.getGud(uid)
        if gud['vip'] < hdinfo['data']['fanli'][0][0]:
            _res['s'] = -3
            _res['errmsg'] = g.L("global_limitvip")
            return _res

        _setData = {
            '$set': {
                'finish': 1,
                'vip': gud['vip']
            }}

        _prize = calcPrize(uid, valiinfo['sum'], hdinfo['data'])
        if not _prize:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_noprize')
            return _res


        _r = g.m.huodongfun.setHDData(uid, hdid, _setData)

        g.m.huodongfun.analysisData(uid, hdid, 'finish', 1)
        g.m.huodongfun.analysisData(uid, hdid, 'sum', valiinfo['sum'])

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        # g.chat.sendMsg(_msg, 1)
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
        _rData['prize'] = _prize

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res




def getHongdian(uid, hdid, hdinfo):

    valiinfo = getOpenData(uid, hdinfo)
    _nt = g.C.NOW()
    val = True
    if not hdinfo['rtime'] < _nt < hdinfo['etime']:
        val = False
        return val

    if valiinfo['myinfo'].get('finish',0) == 1 or valiinfo['sum'] == 0:
        val = False
        return val

    return val


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    # if etype != 'altattr':
    #     return
    #
    # oldattr = args[0]
    # newattr = args[1]
    # if 'rmbmoney' not in oldattr:
    #     return
    #
    # hdid = hdinfo['hdid']
    # diffVal = int(oldattr["rmbmoney"] - newattr["rmbmoney"])
    # if diffVal < 0:
    #     return
    #
    # hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,htype,data,rtime,etime,stime', iscache=0)
    # _day = getDayNum(hdInfo)
    # money = int(int(diffVal) * (hdInfo['data']['zhekou']/100.0))
    # setData = {"$inc": {"val.{0}".format(_day): money}}
    # r = g.m.huodongfun.setHDData(uid, hdid, setData)
    pass

def onLeijixiaofei(uid, _type, val):
    if _type != 'rmbmoney' or val > 0:
        return

    _htype = 20
    # 先查缓存
    _key = 'huodong_' + str(_htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo['rtime']:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': _htype, 'rtime': {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id','rtime','hdid','stime','data'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {'rtime': g.C.ZERO(_nt)}, g.C.ZERO(_nt + 3600*24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo['rtime'] - _nt)

    if _nt > _hdInfo['rtime']:
        return

    hdid = _hdInfo['hdid']
    _day = getDayNum(_hdInfo)
    money = int(abs(val) * (_hdInfo['data']['zhekou']/100.0))
    setData = {"$inc": {"val.{0}".format(_day): money}}
    g.m.huodongfun.setHDData(uid, hdid, setData)

g.event.on('leijixiaofei', onLeijixiaofei)

# 计算应该获得的奖励
def calcPrize(uid, sum, hddata):
    gud = g.getGud(uid)
    rate = hddata['fanli'][0][1]
    for ele in hddata['fanli']:
        if gud['vip'] >= ele[0]:
            rate = ele[1]

    money = int(sum * (rate/100.0))
    if money == 0:
        return []

    val = [{'a':'attr','t':'rmbmoney','n': money}]
    return val

# 计算今天是第几天
def getDayNum(hddata):
    _nt = g.C.NOW()
    timediff = _nt - hddata['stime']
    if timediff < 0: _day = 0
    _day, _ = divmod(timediff, 24 * 3600)
    _day += 1
    return str(_day)

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"$set": {"gotarr": [],"val": {},'finish':0}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)