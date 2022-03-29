#! /usr/bin/python
# -*-coding:utf-8-*-
"""
海滩渔场
"""



import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 45
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,prizedate')
    _date = g.C.DATE(g.C.NOW())
    if hdData.get('prizedate') != _date:
        _item = g.mdb.find1('itemlist',{'uid':uid,'itemid':hdinfo['data']['init']['itemid']},fields=['_id','num']) or {'num':0}
        if _item['num'] < hdinfo['data']['init']['num']:
            _send = g.getPrizeRes(uid, [{'a':'item','t':hdinfo['data']['init']['itemid'],'n':hdinfo['data']['init']['num']-_item['num']}])
            g.sendUidChangeInfo(uid, _send)
        g.m.huodongfun.setHDData(uid, hdid, {'prizedate': _date})

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    _type = str(kwargs['act'])

    hdid = hdinfo['hdid']

    if _type in ('1', '2', '3'):
        _num = str(idx)
        if _num not in hdinfo['data']['arr'][_type]:
            #  参数部队
            _res['s'] = -1
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _need = hdinfo['data']['arr'][_type][_num]['need']

        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if 'rmbmoneyneed' in hdinfo['data']['arr'][_type][_num]:
                # 检查钻石
                _need = hdinfo['data']['arr'][_type][_num]['rmbmoneyneed']
                _chk = g.chkDelNeed(uid, _need)
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _prize = []
        for i in xrange(int(_num)):
            _prize += g.m.diaoluofun.getGroupPrize(hdinfo['data']['arr'][_type][_num]['dlz'])
    else:
        idx = abs(idx)
        _buyNum = abs(int(kwargs['wxcode']))
        hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,gotarr')
        # 次数不足
        if hdData['gotarr'].get(str(idx), 0) >= hdinfo['data']['duihuan'][idx]['num']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_numerr')
            return _res

        _need = hdinfo['data']['duihuan'][idx]['need']
        _need = g.C.dcopy(_need)
        for i in _need:
            i['n'] = i['n'] * _buyNum

        _chk = g.chkDelNeed(uid, _need)
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        g.m.huodongfun.setHDData(uid, hdid, {'$inc': {'gotarr.{}'.format(idx): _buyNum}})
        _prize = hdinfo['data']['duihuan'][idx]['prize']
        _prize = g.C.dcopy(_prize)
        for i in _prize:
            i['n'] = i['n'] * _buyNum

    _sendData = g.delNeed(uid, _need,logdata={'act': 'beachfishery','type':_type})

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprinze", "hdid": hdid})
    g.mergeDict(_prizeMap, _sendData)
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
    _retVal = True
    _info = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,date')
    if 'date' in _info and g.C.DATE(g.C.NOW()) == _info['date']:
        _retVal = False
    else:
        g.m.huodongfun.setHDData(uid, hdid, {'date': g.C.DATE(g.C.NOW())})
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
    setData = {'val': 0, 'gotarr': {}}
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.mc.flush_all()
    hdidinfo = g.m.huodongfun.getHDinfoByHtype(htype)
    a = getPrize(uid, hdidinfo, idx=1, act=1)
    print a