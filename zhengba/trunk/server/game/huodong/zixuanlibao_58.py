#! /usr/bin/python
# -*-coding:utf-8-*-
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('game')


htype = 58
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    _data = kwargs['wxcode']
    hdid = hdinfo['hdid']

    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    # 自选
    if int(act) == 1:
        _set = {}
        for k,v in _data.items():
            if int(k) >= len(hdDataArr['choose']) or v >= len(hdDataArr['choose'][int(k)]):
                # 索引越界
                _res['s'] = -1
                _res['errmsg'] = g.L('global_argserr')
                return _res
            _set["val.{0}.{1}".format(idx, k)] = v

        g.m.huodongfun.setHDData(uid, hdid, _set)
    else:
        # 领取免费得奖励
        # 不免费
        if hdDataArr['price'] > 0:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 已领取
        if str(idx) in hdData['gotarr']:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        g.m.huodongfun.setHDData(uid, hdid, {'$inc': {"gotarr.{}".format(idx): 1}})

        _prize = list(hdDataArr['prize'])
        for k, v in hdData['val'][str(idx)].items():
            _prize.append(hdDataArr['choose'][int(k)][v])

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}, 'hunshi': {}}

        _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprize", "hdid": hdid, 'item':hdData['val'][str(idx)]})
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

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    for idx, i in enumerate(hdinfo['data']['arr']):
        if i['price'] == 0 and str(idx) not in _valInfo['gotarr']:
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
    setData = {'gotarr': {},'val':{}}
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

    payCon = args[2]

    for idx, i in enumerate(hdinfo['data']['arr']):
        if i['proid'] == payCon['proid']:
            break
    else:
        return

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    # 超过充值次数
    if hdData['gotarr'].get(str(idx), 0) >= i['num']:
        return

    _prize = list(i['prize'])
    for k, v in hdData['val'][str(idx)].items():
        _prize.append(i['choose'][int(k)][v])

    _prizeMap = g.getPrizeRes(uid, _prize, {"act": "zixuanlibao", "proid": payCon['proid']})
    g.sendUidChangeInfo(uid, _prizeMap)

    g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'$inc': {"gotarr.{}".format(idx): 1}})


if __name__ == "__main__":
    uid = g.buid("liu200")
    hdid = 1200
    a = rePeatHuoDong()

    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    print a