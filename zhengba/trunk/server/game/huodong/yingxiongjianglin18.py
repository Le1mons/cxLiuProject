#! /usr/bin/python
# coding:utf-8


"""
英雄降临
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 18
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']


    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    hdDataArr = hdData['val'][idx]

    # 1领取
    if int(act) == 1:
        if hdDataArr['buynum'] <= 0:
            _res['s'] = -4
            _res['errmsg'] = g.L('yingxiongjianglin_res_-4')
            return _res

        _need = hdDataArr['need']
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
        _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'hdgetprize'})
        g.sendUidChangeInfo(uid, _sendData)
        _r = g.m.huodongfun.setHDData(uid, hdid, {"$inc": {g.C.STR('val.{1}.buynum',idx): -1}})

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

        _prizeMap = g.getPrizeRes(uid, [hdDataArr["item"]],
                                  {"act": "hdgetprize", "hdid": hdid, "prize": [hdDataArr["item"]]})
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
        _rData["prize"] = [hdDataArr["item"]]

        return _rData
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """
    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    _hdInfo = g.m.huodongfun.getInfo(hdid)
    _arr = _hdInfo['data']['arr']
    _idx = 0
    for i in _arr:
        i['hdid'] = hdid
        i['index'] = _idx
        i['etime'] = _hdInfo['etime']
        _idx += 1
    setData = {"$set": {"gotarr": [],"val": _arr}}
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("1")
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, 1500)
    print _valInfo