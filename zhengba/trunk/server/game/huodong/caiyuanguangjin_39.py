#! /usr/bin/python
# -*-coding:utf-8-*-


"""
财源广进
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 39
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    rdata = {}
    rdata['lessmoney'],rdata['log'] = get_less_money(hdinfo)
    if rdata['lessmoney'] < 0: rdata['lessmoney'] = 0
    # 我的信息
    _valInfo = getData(uid, hdinfo['hdid'])
    _retVal = {"info":rdata,"myinfo": _valInfo}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdData = getData(uid, hdid)
    _prize = []
    # 是否可以领奖
    if hdData['val'] < hdinfo['data']['price']:
        _res = {'s': -1, 'errmsg': g.L('global_valerr')}
        return _res

    # 是否已经领过奖
    if hdData['gotarr']:
        _res = {'s': -2, 'errmsg': g.L('global_algetprize')}
        return _res

    _lessMoney = get_less_money(hdinfo)
    # 奖金不足
    if _lessMoney[0] <= 0:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_noprize')
        return _res

    hdData['gotarr'] = [1]

    _con = hdinfo['data']
    _sumP = sum([x['weight'] for x in _con['arr']])
    _randint = g.C.RANDINT(1, _sumP)
    _newp = 0
    _randmoney = 0
    for ele in _con['arr']:
        _newp += ele['weight']
        if _newp >= _randint:
            _randmoney = min(g.C.RANDINT(ele['numrange'][0], ele['numrange'][1]), _lessMoney[0])
            _prize.append({'a': 'attr', 't': 'rmbmoney', 'n': _randmoney})
            break

    _r = g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": 1},'$set':{'randmoney': _randmoney}})

    # 大于2000钻石则写入日志
    # if _randmoney > _con['loglimit']:
    #     gud = g.getGud(uid)
    #     _data = {
    #         'uid': uid,
    #         'hdid': _hddata['hdid'],
    #         'ext_servername': gud['ext_servername'],
    #         'name': gud['name'],
    #         'rmbmoney': _randmoney,
    #         'ttltime': g.C.UTCNOW(),
    #         'ctime': g.C.NOW()
    #     }
    #     _r = g.crossDB.insert('cygjlog', _data)

    # 扣除中奖金额
    if _randmoney:
        _set = {'$inc': {'v': -_randmoney}}
        if _randmoney >= 2000:
            _set['$push'] = {'log': {'$each':[{
                "name": g.getGud(uid)['name'],
                'svr_name':g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid']),
                "val": _randmoney
            }], '$slice': -50}}
        g.crossDB.update('cross_hddata',{'hdid':hdinfo['hdid']},_set)


    _prizeMap = g.getPrizeRes(uid, _prize, {'act': 'cygj_getprize'})
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
    _lessmoney, _ = get_less_money(hdinfo)
    if _lessmoney <= 0:
        return False

    data = getData(uid, hdid)
    if not data['gotarr'] and data['val'] >= hdinfo['data']['price']:
        return True
    return False

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"$set": {"gotarr": [],"val": 0,'cztime':0,'randmoney':0}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        return
    _nt = g.C.NOW()
    # 活动结束
    if _nt > hdinfo['rtime']:
        return

    hdData = getData(uid, hdinfo['hdid'])
    # if hdData['gotarr'] or hdData['val'] >= hdinfo['data']['price']:
    #     return

    hdData['val'] += args[2]['unitPrice'] / 100
    hdData['cztime'] = g.C.NOW()

    g.m.huodongfun.setMyHuodongData(uid, int(hdinfo['hdid']), hdData)


def get_hd_info(uid,hdid):
    _retVal = {'val':0,'prize':0}
    _r = g.crossDB.find1('cross_hddata',{'uid':uid,'hdid':int(hdid)})
    _zt = g.C.NOW(g.C.DATE())
    if _r and _r['lasttime'] > _zt:
        _retVal = _r['v']

    return _retVal

# 获取剩余钻石
def get_less_money(hdinfo):
    _retVal = 0
    _r = g.crossDB.find1('cross_hddata', {'hdid': hdinfo['hdid']})
    if _r:
        _retVal = _r['v']
        _log = _r.get('log', [])
    else:
        _retVal = hdinfo['data']['totalmoney']
        _r = g.crossDB.update('cross_hddata', {'hdid': hdinfo['hdid']}, {'v': hdinfo['data']['totalmoney']}, upsert=True)
        _log = []

    return _retVal, _log

def getData(uid, hdid):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,randmoney,cztime')
    # 不是同一天
    if g.C.DATE(hdData['cztime']) != g.C.DATE():
        hdData = {'val':0,'gotarr':[],'randmoney':0}
    return hdData


if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 1547653100
    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = hdEvent(uid, hdidinfo,'chongzhi',1,1,{'unitPrice': 500000})
    # a = getPrize(uid, hdidinfo,idx=1,act=1)
    # a = getOpenData(uid, hdidinfo)
    # a = getHongdian(uid, hdid, hdidinfo)
    # print a