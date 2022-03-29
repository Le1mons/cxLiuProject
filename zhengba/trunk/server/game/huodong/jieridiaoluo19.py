#! /usr/bin/python
# -*-coding:utf-8-*-


"""
节日掉落

"""



htype = 19
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']

    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data,intr,htype,rtime,ttype,resdata,etime', iscache=0)
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')

    #该活动没有任何值时的特殊处理
    if hdData == None:hdData = {"val":0,"gotarr":[]}
    if "lasttime" in hdData:del hdData["lasttime"]
    if "gotarr" not in hdData:
        hdData["gotarr"] = []
    if 'data' not in hdInfo:
        hdInfo['data'] = {}

    # 加入结束时间
    if 'etime' in hdInfo:
        hdInfo["data"].update({'etime':hdInfo['etime']})

    _retVal = {"info":hdInfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = int(kwargs['idx'])
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if hdDataArr["val"] in hdData['gotarr']:
        # 已经领取过奖励
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _need = hdDataArr['val']
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

    g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": hdDataArr["val"]}})
    _rData["cinfo"] = _sendData
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

    return _rData


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):

    setData = {"$inc": {"val": 0}, "$set": {"gotarr": []}}
    if data:
        setData.update(data)
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a