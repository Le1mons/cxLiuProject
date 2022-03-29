#! /usr/bin/python
# -*-coding:utf-8-*-


"""
竞猜活动
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 40
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    return {"info":hdinfo['data'],"myinfo":hdData}


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = abs(int(kwargs['idx']))
    act = kwargs['act']
    hdid = hdinfo['hdid']
    myhdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # 竞猜
    if int(act) == 1:
        # 竞猜时间已经过了
        if g.C.NOW() > hdinfo['rtime']:
            # 活动已结束
            _res['s'] = -5
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 不能重复竞猜
        if myhdData['val'] != -1:
            # 当日购买次数不足
            _res['s'] = -1
            _res['errmsg'] = g.L('global_argserr')
            return _res

        if myhdData['gotarr']:
            # 奖励已领取
            _res['s'] = -6
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _need = [{'a':'attr', 't':'rmbmoney', 'n': hdinfo['data']['arr'][idx]['guessneed']}]
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'hd'})
        g.sendUidChangeInfo(uid, _sendData)

        g.m.huodongfun.setHDData(uid, hdid, {'val': idx})
        _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)
        return _rData

    # 领取
    elif int(act) == 2:
        # 团购还没结束或者已经过了领取返现的时间
        if g.C.NOW() < hdinfo['rtime']:
            # 参数信息有误
            _res['s'] = -3
            _res['errmsg'] = g.L('global_noprize')
            return _res

        # 猜错了
        if myhdData['val'] != hdinfo['data']['win']:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_valerr')
            return _res

        if myhdData['gotarr']:
            # 奖励已领取
            _res['s'] = -6
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        if idx != myhdData['val']:
            # 不是猜的这个
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        _prize = hdinfo['data']['arr'][idx]['p']
        g.m.huodongfun.setMyHuodongData(uid,hdid,{'$push':{'gotarr':1}})
        _prizeMap = g.getPrizeRes(uid, _prize,
                                  {"act": "hdgetprize", "hdid": hdid, "prize":_prize})

    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
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

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _nt = g.C.NOW()
    # 团购还没结束或者已经过了领取返现的时间
    if _nt < hdinfo['rtime'] or _nt > hdinfo['etime']:
        return _retVal

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # 已经领奖了
    if hdData['gotarr'] or hdData['val'] != hdinfo['data']['win'] or hdData['val'] == -1:
        return _retVal

    return True

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"$set": {"gotarr": [],"val": -1}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass




if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 1547653100
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = hdEvent(uid, hdidinfo,'chongzhi',1,1,{'unitPrice': 500000})
    # a = getPrize(uid, hdidinfo,idx=1,act=1)
    a = getOpenData(uid, hdidinfo)
    # a = getHongdian(uid, hdid, hdidinfo)
    print a