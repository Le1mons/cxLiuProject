#! /usr/bin/python
# -*-coding:utf-8-*-


"""
黄金矿工
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 47
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,prizedate,buynum')
    _nt = g.C.NOW()
    _date = g.C.DATE(_nt)
    if hdData.get('prizedate') != _date:
        _con = g.GC['goldminer']
        _item = g.mdb.find1('itemlist',{'uid':uid,'itemid':_con['init']['itemid']},fields=['_id','num']) or {'num':0}
        if _item['num'] < _con['init']['num'] and hdinfo["rtime"] > _nt:
            _send = g.getPrizeRes(uid, [{'a':'item','t':_con['init']['itemid'],'n':_con['init']['num']-_item['num']}])
            g.sendUidChangeInfo(uid, _send)
        g.m.huodongfun.setHDData(uid, hdid, {'prizedate': _date,'buynum':0})

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']
    _con = g.GC['goldminer']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,buynum')
    # 1 挖矿
    if int(act) == 1:
        # 午时已到
        if g.C.NOW() > hdinfo['rtime']:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _need = _con['need']
        _prize = [{'a':'item','t':_con['animal2item'][str(idx)]['item'],'n':g.C.RANDINT(*_con['animal2item'][str(idx)]['num'])}]
    # 购买晶石 挖矿用的
    elif int(act) == 2:
        _num = abs(int(idx))
        # 午时已到
        if g.C.NOW() > hdinfo['rtime']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _curNum = hdData.get('buynum', 0) + _num
        # 剩余购买次数不足
        if _curNum > len(_con['lottery']['cost']):
            _res['s'] = -1
            _res['errmsg'] = g.L('global_numerr')
            return _res

        _need = []
        for i in xrange(hdData.get('buynum', 0),_curNum):
            _need += _con['lottery']['cost'][i]
        _need = g.fmtPrizeList(_need)
        _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _con['lottery']['prize']]
    # 积分兑换
    else:
        idx = abs(int(idx))
        _buyNum = abs(int(kwargs.get('wxcode', 1)))
        # 兑换次数不足
        if hdData['val'].get(str(idx), 0) + _buyNum > hdinfo['data']['arr'][idx]['num']:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_numerr')
            return _res

        _prize = [{'a':i['a'],'t':i['t'],'n':i['n'] * _buyNum} for i in hdinfo['data']['arr'][idx]['prize']]
        _need = [{'a':i['a'],'t':i['t'],'n':i['n'] * _buyNum} for i in hdinfo['data']['arr'][idx]['need']]

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

    if int(act) == 2:
        g.m.huodongfun.setHDData(uid, hdid, {'buynum': _curNum})
    elif int(act) == 3:
        g.m.huodongfun.setHDData(uid, hdid, {'$inc':{'val.{}'.format(idx): _buyNum}})

    _delData = g.delNeed(uid, _need, logdata={'act': 'gold_miner','goldact':act,'idx':idx})
    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
    g.mergeDict(_changeInfo, _delData)

    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "gold_miner",'goldact':act,'idx':idx,'hdid':hdid})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid, keys='_id,val,gotarr,buynum')
    _rData["prize"] = _prize

    return _rData

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _chk = g.chkDelNeed(uid, g.GC['goldminer']['need'])
    # 材料不足
    if _chk['res']:
        _retVal = True
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

    setData = {'val':{},'gotarr':[]}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a