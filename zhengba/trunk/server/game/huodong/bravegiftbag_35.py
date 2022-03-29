#! /usr/bin/python
# -*-coding:utf-8-*-


"""
勇者礼包
"""
from random import shuffle
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 35
import g


def getOpenList(uid, hdinfo):
    _data = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,cztime')
    # 如果没有购买礼包  并且超过了rtime  就不显示
    if not _data['val'] and g.C.NOW() >= hdinfo['rtime']:
        return False

    _chkDay = g.C.getDateDiff(_data.get('cztime',g.C.NOW()), g.C.NOW()) >= len(hdinfo['data']['arr'])
    if len(hdinfo['data']['arr']) == len(_data['gotarr']) and _chkDay:
        return False

    # 邮件发奖
    if _chkDay:
        _prize = []
        for idx, prize in enumerate(hdinfo['data']['arr']):
            if idx not in _data['gotarr']:
                _prize += prize
                _data['gotarr'].append(idx)
        _prize = g.fmtPrizeList(_prize)
        g.m.emailfun.sendEmails([uid], 1, hdinfo['data']['email']['title'], hdinfo['data']['email']['content'], _prize)
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {"gotarr": _data['gotarr']})
        return False

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,cztime')
    # 非同一天
    _diffDay = g.C.getDateDiff(hdData.get('cztime',g.C.NOW()), g.C.NOW()) + 1
    if _diffDay > 1:
        g.m.huodongfun.setHDData(uid, hdid, {"val": _diffDay})

    if hdData['val'] > len(hdData['gotarr']) + 1:
        hdData['val'] = len(hdData['gotarr']) + 1
    _gameVer = g.getGameVer()
    # 支付配置
    _payConJSON = g.m.payfun.getPayCon("paycon")[_gameVer]
    hdinfo['data'].update(_payConJSON['weekfound_68'])
    hdinfo['data']['proid'] = 'weekfound_68'
    return {"info":hdinfo["data"],"myinfo":hdData}


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = abs(int(kwargs['idx']))
    _act = int(kwargs['act'])
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # 领取
    if _act == 1:
        if hdData['val'] == 0:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 判断天数
        if hdData['val'] <= idx:
            _res['s'] = -5
            _res['errmsg'] = g.L('global_valerr')
            return _res

        # 已经领取了
        if idx in hdData['gotarr']:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": idx}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, hdDataArr,
                                  {"act": "hdgetprize", "hdid": hdid, "idx": idx})
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

def getHongdian(uid, hdid, hdinfo):
    hdData = getOpenData(uid, hdinfo)['myinfo']
    if not hdData['val']:
        return False

    return hdData['val'] > len(hdData['gotarr'])


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
    if etype != 'chongzhi':
        return
    _nt = g.C.NOW()
    # 活动结束
    if _nt > hdinfo['rtime']:
        return

    if args[2]['proid'] != 'weekfound_68':
        return

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val')
    # 已经激活了
    if hdData['val'] != 0:
        return

    g.m.huodongfun.setMyHuodongData(uid, int(hdinfo['hdid']), {'val': 1,'cztime':g.C.NOW()})

def timer_sendPrize(htype):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'huodong_' + str(htype), 'k': _dKey}
    _data = g.mdb.find1('rankprize', _w)
    if _data:
        print "ZhouChangHD Already Send==", _dKey, htype
        return

    _info = g.mdb.find1('hdinfo', {'htype': htype, 'etime': {"$gte": _nt-10*3600,'$lte': _nt+10*3600}})
    if not _info:
        print "ZhouChangHD Not Send==", _dKey, htype
        return

    _emailData = {
        "etype": 1,
        "ctime": _nt,
        "passtime": _nt + 15 * 24 * 3600,
        "isread": 0,
        "title": _info['data']['email']['title'],
        "content": _info['data']['email']['content'],
        'ttltime': g.C.TTL(),
        'getprize': 0
    }
    _set = []
    _all = g.mdb.find('hddata', {'hdid': _info['hdid']})
    for i in _all:
        if i['val'] == 0:
            continue
        i['val'] += g.C.getDateDiff(i.get('time', g.C.NOW()), g.C.NOW())
        _prize = []
        for idx, prize in enumerate(_info['data']['arr']):
            if idx not in i['gotarr'] and i['val']-1 >= idx:
                _prize += prize
        if not _prize:
            continue
        _emailData.update({'uid': i['uid'], 'prize': _prize})
        _set.append(_emailData.copy())
    # 添加邮件
    if _set:
        g.mdb.insert('email', _set)
    g.mdb.update('rankprize', _w, {'v': _set, 'lasttime': _nt}, upsert=True)