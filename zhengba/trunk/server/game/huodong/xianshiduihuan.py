#! /usr/bin/python
# -*-coding:utf-8-*-


"""
限时兑换

活动期间累积充值达到对应额度，即可领取超值奖励，任意充值均可累积

"""
if __name__ == '__main__':
    import sys
    sys.path.append('..')


htype = 10
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,data')

    #该活动没有任何值时的特殊处理
    # if hdData == None:hdData = {"val":0,"gotarr":[]}
    if "lasttime" in hdData:del hdData["lasttime"]
    # if "gotarr" not in hdData:
    #     hdData["gotarr"] = []
    if 'data' not in hdInfo:
        hdInfo['data'] = {}

    # 加入结束时间
    if 'etime' in hdInfo:
        hdInfo["data"].update({'etime':hdInfo['etime']})

    # _retVal = {"info":hdInfo["data"],"myinfo":hdData['data']}
    _retVal = {"info":{'etime':hdInfo['etime']},"myinfo":hdData['data']}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    # 要购买的数量
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,data')
    if not hdData:
        _arr = hdinfo['data']['arr']
        _buyNum = _arr[idx]['buynum']
    else:
        _arr = hdData['data']['arr']
        _buyNum = _arr[idx]['buynum']
    # 购买次数不足
    if _buyNum < act:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*act} for i in hdDataArr['need']]
    _chk = g.chkDelNeed(uid, _need)
    # 判断消耗品是否充足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res
    _sendData = g.delNeed(uid, _need, logdata={'act': 'xianshiduihuan'})
    g.sendUidChangeInfo(uid, _sendData)
    if _arr[idx]['buynum'] != -1:
        _arr[idx]['buynum'] -= act
        g.m.huodongfun.setHDData(uid, hdid, {'data':{'arr': _arr}})
    # _rData["cinfo"] = _sendData
    _p = [{'a':i['a'],'t':i['t'],'n':i['n']*act} for i in _arr[idx]['p']]
    _sendData = g.getPrizeRes(uid, _p,{'act':'xianshiduihuan','hdid':hdid,'need':_need})
    g.sendUidChangeInfo(uid, _sendData)
    _rData["myinfo"] = {'buynum': _arr[idx]['buynum']}
    return _rData


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {"$inc": {"val": 0}, "$set": {"gotarr": []}}
    _hdInfo = g.m.huodongfun.getHuodongInfoById(hdid)
    # if not _hdInfo:
    #     return
    setData['$set'].update({'data': _hdInfo['data']})
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("2")
    hdid = 1000
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a