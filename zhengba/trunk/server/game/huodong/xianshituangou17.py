#! /usr/bin/python
# -*-coding:utf-8-*-


"""
限时团购
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 17
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    _crossData = g.crossDB.find1('cross_hddata',{'uid':'SYSTEM','hdid':hdid})
    if not _crossData:
        _setData = []
        for i in xrange(len(hdinfo['data']['arr'])):
            _temp = {}
            _temp['buynum'] = 0
            _temp['need'] = hdinfo['data']['arr'][i]['need']
            _sale = 100
            for k, v in hdinfo['data']['arr'][i]['num2sale']:
                if _temp['buynum'] < k:
                    break
                _sale = v
            hdinfo['data']['arr'][i]['sale'] = _temp['sale'] = _sale
            _setData.append(_temp)

        _crossData = {'arr': _setData}
        g.crossDB.insert('cross_hddata',{'uid':'SYSTEM','hdid':hdid,'arr':_setData})

    else:
        for idx,data in enumerate(hdinfo['data']['arr']):
            data['buynum'] = _crossData['arr'][idx]['buynum']
            data['sale'] = _crossData['arr'][idx]['sale']
    # 返现
    myhdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,receive')
    _prize = g.m.huodongfun.getCashBackPrize(myhdData['val'], _crossData['arr'])
    # 处于购买期
    _nt = g.C.NOW()
    _res = []
    hdData = g.getAttrByDate(uid, {'ctype':'xianshi_tuangou','k':hdid},keys='_id,v')
    if hdData:
        _res = hdData[0]['v']
    else:
        _res = hdinfo['data']['arr']

    _retVal = {"info":hdinfo['data']['arr'],"myinfo":{'val':_prize,'gotarr':_res,'receive':myhdData.get('receive',0)}}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    myhdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,receive')
    _crossData = g.crossDB.find1('cross_hddata', {'uid': 'SYSTEM', 'hdid': hdid}, fields=['_id','arr'])
    hdData = g.getAttrByDate(uid, {'ctype': 'xianshi_tuangou','k':hdid},keys='_id,v')
    _nt = g.C.NOW()
    # 1领取
    if int(act) == 1:
        # 团购结束
        if _nt > hdinfo['rtime']:
            # 活动已结束
            _res['s'] = -5
            _res['errmsg'] = g.L('xianshituangou_res_-5')
            return _res

        _hdInfo = hdData[0]['v'] if hdData else hdinfo['data']['arr']
        hdDataArr = _hdInfo[idx]
        if hdDataArr['daynum'] <= 0:
            # 当日购买次数不足
            _res['s'] = -1
            _res['errmsg'] = g.L('xianshituangou_res_-1')
            return _res

        _buyNum = _crossData['arr'][idx]['buynum'] = _crossData['arr'][idx].get('buynum',0)+1
        _sale = 100
        for k,v in hdinfo['data']['arr'][idx]['num2sale']:
            if _buyNum < k:
                break
            _sale = v

        _crossData['arr'][idx]['sale'] = _sale

        _need = hdinfo['data']['arr'][idx]['need']
        _need = [{'a':i['a'],'t':i['t'],'n':int(i['n']*_sale*0.01)} for i in _need]
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

        _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'xianshituangou'})
        g.sendUidChangeInfo(uid, _sendData)

        g.crossDB.update('cross_hddata', {'uid': 'SYSTEM', 'hdid': hdid},{'arr':_crossData['arr']})
        _hdInfo[idx]['daynum'] -= 1
        g.setAttr(uid,{'ctype':'xianshi_tuangou','k':hdid},{'v':_hdInfo})
        # 更新此次购买的次数和消耗
        _tuangou = myhdData['val'].get(str(idx),{'expend':[],'buynum':0})
        _expend = _tuangou['expend']
        _v = _tuangou['buynum'] + 1
        _expend = g.fmtPrizeList(_expend + _need)
        g.m.huodongfun.setHDData(uid, hdid, {g.C.STR('val.{1}',idx):{'buynum':_v, 'expend':_expend}})

        _prize = hdinfo['data']['arr'][idx]["p"]
        _prizeMap = g.getPrizeRes(uid, _prize,
                                  {"act": "hdgetprize", "hdid": hdid, "prize": _prize})

    elif int(act) == 2:
        # 团购还没结束或者已经过了领取返现的时间
        if _nt < hdinfo['rtime'] or _nt > hdinfo['etime']:
            # 参数信息有误
            _res['s'] = -3
            _res['errmsg'] = g.L('xianshituangou_res_-3')
            return _res

        if myhdData.get('receive'):
            # 奖励已领取
            _res['s'] = -6
            _res['errmsg'] = g.L('xianshituangou_res_-6')
            return _res

        _arr = _crossData['arr']
        _prize = g.m.huodongfun.getCashBackPrize(myhdData['val'],_arr)
        if _prize[0]['n'] <= 0:
            # 没有钻石可领取
            _res['s'] = -4
            _res['errmsg'] = g.L('xianshituangou_res_-4')
            return _res

        g.m.huodongfun.setMyHuodongData(uid,hdid,{'$set':{'receive':1,'val':{}}})
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
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,receive')
    _nt = g.C.NOW()
    # 团购还没结束或者已经过了领取返现的时间
    if _nt < hdinfo['rtime'] or _nt > hdinfo['etime']:
        return _retVal

    _crossData = g.crossDB.find1('cross_hddata', {'uid': 'SYSTEM', 'hdid': hdid})
    if not _crossData:
        return _retVal

    _arr = _crossData['arr']
    _cashBack = g.m.huodongfun.getCashBackPrize(hdData['val'], _arr)
    if _cashBack[0]['n'] > 0 and not hdData.get('receive'):
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
    setData = {"$set": {"gotarr": [],"val": {},'receive':0}}
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