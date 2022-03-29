# coding:utf8
'''
单笔充值
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")
    
htype = 2
import g

def getOpenList(uid, hdinfo):
    return hdinfo

def getOpenData(uid, hdinfo):
    hdInfoData = hdinfo['data']
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime,rechargetime')
    hdData = getGetLessNumData(uid, hdinfo["hdid"], hdinfo['data'], hdData)

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal

def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if int(act) == 1:
        if idx in hdData['gotarr']:
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res
        
        #todo...这个判断没验证过，上线是话，需要确认
        if idx not in hdData['val']:
            _res['s'] = -4
            _res['errmsg'] = g.L('dianjindaren_getprize_res_-4')
            return _res        

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
        g.m.huodongfun.setMyHuodongData(uid, hdid, {"$push": {"gotarr": idx},'$pull':{'val':idx}})
        _prizeMap = g.getPrizeRes(uid, hdDataArr["p"],{'act':'hdgetprize'})
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
    
    else:
        # 参数信息有误
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res    

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt > hdinfo['etime']:
        return _retVal

    if len(_valInfo['val']) > 0:
        _retVal = True

    return _retVal

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    _proid = args[0]
    _money = args[1]
    _payCon = args[2]
    _czNeed = _payCon['rmbmoney']
    _val = 0
    _idx = -1
    for idx,i in enumerate(hdinfo['data']['arr']):
        _min = i['czneed'][0]
        _max = i['czneed'][1]
        if _min <= _czNeed <= _max:
            _val = i['czval']
            _idx = idx
            break
    if _val:
        _zt = g.C.ZERO(g.C.NOW())
        # 获取我的活动信息
        myHdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo["hdid"], keys='_id,lasttime,val,gotarr,rechargetime')
        myHdData = getGetLessNumData(uid, hdinfo["hdid"], hdinfo['data'],myHdData)
        if _idx in myHdData['val'] or _idx in myHdData['gotarr']:
            return
        mylastimezt = g.C.ZERO(myHdData.get('rechargetime'))  #todo...lasttime有问题，不能这么用，参见wiki
        # 当天不在累计
        if _zt == mylastimezt:
            _setData = {'$push':{'val': _idx},'$set':{'rechargetime':g.C.NOW()}}
        else:
            _setData = {'$set': {'val': [_idx],'gotarr':[],'rechargetime':g.C.NOW()}}
        g.m.huodongfun.setMyHuodongData(uid, hdinfo['hdid'], _setData)
        g.m.mymq.sendAPI(uid, 'activity_redpoint', 'dbcz')

def initHdData(uid,hdid,data=None,*args,**kwargs):
    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data', iscache=0)
    setData = {'gotarr': [], 'val': [], 'rechargetime': g.C.NOW()}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


# 获取带剩余次数的数据  {"val":[x,x,x,x],"gotarr":[y,y,y,y]}
# defval = 默认值
def getGetLessNumData(uid, hdid, hddata, valinfo=None, defval=1, lessnum=0):
    _nt = g.C.NOW()
    _valInfo = valinfo
    # if _valInfo == None:
    #     _valInfo = getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')

    _defVal = []
    # 默认值为0
    # if defval == 0:
    #     _defVal = [0] * len(hddata["arr"])

    # 第一次生成数据
    if _valInfo == None:
        _valInfo = {"val": _defVal, "gotarr": []}
        _r = g.m.huodongfun.setMyHuodongData(uid, hdid, _valInfo)
    else:
        _resetTime = hddata["reset"]
        _isTd = True
        if _resetTime != -1:
            # 是否今日
            _isTd = g.C.chkSameDate(_nt, int(_valInfo.get('rechargetime',valinfo['lasttime'])), _resetTime)

        if _isTd == False:
            # 重置数据
            _valInfo = {"val": _defVal, "gotarr": [],'rechargetime':_nt}
            _r = g.m.huodongfun.setMyHuodongData(uid, hdid, _valInfo)

    # 扣除剩余次数
    # if lessnum == 1:
    #     _nGotArr = _valInfo["gotarr"]
    #     for i, ele in enumerate(hddata["arr"]):
    #         if str(i) in _nGotArr:
    #             ele["val"] = ele["val"] - _nGotArr[str(i)]
    #             # 对剩余次数做异常处理
    #             if ele['val'] < 0: ele['val'] = 0

    return _valInfo


if __name__ == '__main__':
    #getHongdian()
    pass