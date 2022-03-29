#! /usr/bin/python
# -*-coding:utf-8-*-


"""
限时招募
"""
from random import shuffle
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 31
import g

def getOpenList(uid, hdinfo):
    hdinfo['icon'] = 'ico_event_xszm'
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,idx')
    # 免费次数
    _con = g.GC['xianshi_zhaomu']
    hdData['freenum'] = 1 if g.m.xszmfun.isFreeNumExists(uid) else 0
    # 排行信息
    _rankInfo = g.m.xszmfun.getRankData(hdinfo, uid, hdData)
    # 还剩多少次必出五星
    _num = _con['data']['15']['special'] - hdData.get('idx', 0)
    if _num < 0:
        _num = len(_con['data']['1']['dlz']) - hdData['idx'] + _con['data']['15']['special']

    hdData.update({'rank':_rankInfo,'num':_num})
    return {"myinfo":hdData,'hdinfo': hdinfo}


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # 1领取
    if int(act) == 1:
        if idx in hdData['gotarr']:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _con = hdinfo['data']['jifen2prize']
        # 未完成任务
        if hdData['val'] < _con[idx][0]:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": idx}})
        _prizeMap = g.getPrizeRes(uid, _con[idx][1],
                                  {"act": "xszm_recprize", 'idx': idx})
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
        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    # 活动未开启
    if not hdinfo:
        return 0

    _nt = g.C.NOW()
    if _nt > hdinfo["rtime"]:
        return 0

    # 有免费次数 就直接返回
    if g.m.xszmfun.isFreeNumExists(uid):
        return 1

    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')

    # 充值金额满足某一档
    for idx, ele in enumerate(hdinfo['data']['jifen2prize']):
        if idx not in _valInfo['gotarr'] and _valInfo['val'] >= ele[0]:
            return 1

    return 0

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"val": 0, "gotarr": []}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass