#! /usr/bin/python
# -*-coding:utf-8-*-


"""
贵族折扣
"""
from random import shuffle
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 37
import g


def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    if int(hdinfo['data']['reset']) == 0 and _valInfo:
        _zt = g.C.NOW(g.C.DATE())
        if _valInfo['lasttime'] < _zt: _valInfo = None

    if not _valInfo:
        _valInfo = {
            'val': 0,
            'gotarr': {}
        }
        g.m.huodongfun.setMyHuodongData(uid, hdid, _valInfo)

    return {"info":hdinfo["data"],"myinfo":_valInfo}


def getPrize(uid, hdinfo, *args, **kwargs):
    idx = abs(int(kwargs['idx']))
    hdid = hdinfo['hdid']
    _res = {}
    _valInfo = getOpenData(uid, hdinfo)['myinfo']
    _pCon = hdinfo['data']['arr'][idx]
    _val = str(_pCon['val'])
    # 检查次数
    if _val in _valInfo['gotarr'] and _valInfo['gotarr'][_val] >= _pCon['bnum']:
        _res['s'] = -1
        _res['errmsg'] = g.L("guizuzhekou_-1")
        return _res

    # 检查vip
    gud = g.getGud(uid)
    if gud['vip'] < _pCon['needvip']:
        _res['s'] = -2
        _res['errmsg'] = g.L("global_limitvip")
        return _res

    # 检查消耗
    _need = [{'a': 'attr', 't': 'rmbmoney', 'n': int(_pCon['price'] * 0.01 * _pCon['sale'])}]
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

    _sendData = g.delNeed(uid, _need,logdata={'act': 'guizuzhekou'})

    # 扣除消耗
    _prize = _pCon['p']
    _changeInfo = g.getPrizeRes(uid, _prize, {'act': 'guizuzhekou'})
    g.mergeDict(_changeInfo, _sendData)

    # 设置活动数据
    if _val not in _valInfo['gotarr']: _valInfo['gotarr'][_val] = 0
    _valInfo['gotarr'][_val] += 1
    g.m.huodongfun.setMyHuodongData(uid, hdid, _valInfo)
    _res = {
        'cinfo': _changeInfo,
        'prize': _prize,
        'myinfo': g.m.huodongfun.getHDData(uid, hdid)
    }

    return _res

def getHongdian(uid, hdid, hdinfo):
    _res = False
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
    setData = {'val':0,'gotarr':{}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

def getData(uid, hdid):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    # 不是同一天
    if g.C.ZERO(hdData['lasttime']) != g.C.ZERO(g.C.NOW()):
        hdData = {'val':0,'gotarr':{}}
    return hdData