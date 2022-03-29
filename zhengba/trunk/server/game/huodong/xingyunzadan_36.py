#! /usr/bin/python
# -*-coding:utf-8-*-


"""
幸运砸蛋
"""
from random import shuffle
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 36
import g


def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,zjdarr,usenum,lessnum,lasttime')
    if int(hdinfo['data']['reset']) == 0 and _valInfo:
        _zt = g.C.NOW(g.C.DATE())
        if _valInfo['lasttime'] < _zt: _valInfo = None

    if not _valInfo:
        _valInfo = {
            "val":0, # 累计充值/消费金额
            "gotarr":[], # 已领取金额
            "usenum":0, # 已砸蛋次数
            "zjdarr":[], # 砸金蛋数组
            "lessnum":0 # 剩余可以砸蛋次数
        }
        g.m.huodongfun.setMyHuodongData(uid,hdid, _valInfo)

    # 当期那充值金额最大可充值次数
    _valInfo['num'] = int(_valInfo['val']/hdinfo['data']['unit'])
    if _valInfo['num'] > hdinfo['data']['maxnum']: _valInfo['num'] = hdinfo['data']['maxnum']
    return {"info":hdinfo["data"],"myinfo":_valInfo}


def getPrize(uid, hdinfo, *args, **kwargs):
    # 判断是否已经有剩余次数
    _res = {}
    idx = abs(int(kwargs['idx']))
    hdid = hdinfo['hdid']
    valiinfo = getData(uid, hdinfo)
    # 次数不足
    if valiinfo['lessnum'] < 1:
        _res['s'] = -2
        _res['errmsg'] = g.L('xingyunzadan_-2')
        return _res

    # 砸过这个蛋
    if idx in valiinfo['zjdarr']:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_noprize')
        return _res

    # 判断是否已经领完奖
    _canPrizeArr = [x['val'] for x in hdinfo['data']['arr']]
    if len(set(_canPrizeArr) - set(valiinfo['gotarr'])) < 1:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _rawPrize = []
    _sumP = 0
    for ele in hdinfo['data']['arr']:
        if ele['val'] in valiinfo['gotarr']:
            continue

        _rawPrize.append(ele)
        _sumP += ele['weight']

    _randint = g.C.RANDINT(1, _sumP)
    _prize = []
    _val = ''
    _newP = 0
    for ele in _rawPrize:
        _newP += ele['weight']
        if _randint <= _newP:
            _prize = ele['p']
            _val = ele['val']
            break

    if not _prize:
        _res['s'] = -4
        _res['errmsg'] = g.L('hd_zajindan_-3')
        return _res

    _setData = {
        '$set': {
            'gotarr': valiinfo['gotarr'] + [_val],
            'zjdarr': valiinfo['zjdarr'] + [int(idx)],
            'lessnum': valiinfo['lessnum'] - 1,
            'usenum': valiinfo['usenum'] + 1
        }}

    g.m.huodongfun.setMyHuodongData(uid, hdid, _setData)
    # g.m.huodongfun.analysisData(uid, hdid, "tier" + str(_val), 1)

    _changeInfo = g.getPrizeRes(uid, _prize, {'act': 'hd_zajindan_prize'})
    _res = {
        'cinfo': _changeInfo,
        'myinfo': g.m.huodongfun.getHDData(uid, hdid),
        'prize':_prize
    }
    return _res

def getHongdian(uid, hdid, hdinfo):
    _res = False
    hdData = getData(uid, hdinfo)
    if hdData.get('lessnum', 0) > 0:
        _res = not _res
    return _res


def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {
            "val":0, # 累计充值/消费金额
            "gotarr":[], # 已领取金额
            "usenum":0, # 已砸蛋次数
            "zjdarr":[], # 砸金蛋数组
        }
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != hdinfo['data']['mode']:
        return
    _nt = g.C.NOW()
    # 活动结束
    if _nt > hdinfo['rtime']:
        return

    hdData = getData(uid, hdinfo)
    hdData['val'] += args[2]['unitPrice'] / 10
    # 剩余次数
    _maxNum = int(hdData['val']/hdinfo['data']['unit'])
    if _maxNum > hdinfo['data']['maxnum']:
        _maxNum = hdinfo['data']['maxnum']

    hdData['lessnum'] = _maxNum - hdData['usenum']
    hdData.update({'cztime': g.C.NOW()})
    g.m.huodongfun.setMyHuodongData(uid, int(hdinfo['hdid']), hdData)

def getData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,usenum,lessnum,cztime,zjdarr,gotarr')
    # 不是同一天
    if int(hdinfo['data']['reset']) != -1 and 'cztime' in hdData and g.C.ZERO(hdData['cztime']) != g.C.ZERO(g.C.NOW()):
        hdData = {
            "val":0, # 累计充值/消费金额
            "gotarr":[], # 已领取金额
            "usenum":0, # 已砸蛋次数
            "zjdarr":[], # 砸金蛋数组
            "lessnum":0 # 剩余可以砸蛋次数
        }
    return hdData