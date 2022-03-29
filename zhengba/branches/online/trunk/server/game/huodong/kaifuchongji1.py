# coding:utf8
'''
开服冲级
'''
htype = 1
import g

def getOpenList(uid, hdinfo):
    return hdinfo

def getOpenData(uid, hdinfo):
    hdInfoData = hdinfo['data']
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    if not hdData:
        val = g.getGud(uid)['lv']
        hdData = {'val':val,'gotarr':[]}
        g.m.huodongfun.setHDData(uid, hdid, {'val':val,'gotarr':[]})

    _systemData = g.m.huodongfun.getHDData('SYSTEM', hdid, keys='_id,arr')
    if not _systemData:
        _systemData = hdinfo['data']
        _systemData.update({'val':0,'gotarr':[]})
        g.m.huodongfun.setHDData('SYSTEM', hdid, _systemData)

    _retVal = {"info":_systemData,"myinfo":hdData}
    return _retVal

def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['arr'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _systemData = g.m.huodongfun.getHDData('SYSTEM', hdid, keys='_id,arr')
    
    if int(act) == 1:
        gud = g.getGud(uid)
        if gud['lv'] < hdDataArr["val"]:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_noprize')
            return _res        
        
        if hdDataArr["val"] in hdData.get('gotarr',[]):
            # 已经领取过奖励
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        if _systemData['arr'][idx]['buynum'] < 1:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_noprize')
            return _res
    
        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
        g.m.huodongfun.setMyHuodongData(uid, hdid, {"$push": {"gotarr": hdDataArr["val"]}})
        g.m.huodongfun.setHDData('SYSTEM', hdid, {"$inc": {"arr.{}.buynum".format(idx): -1}})
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

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _systemData = g.m.huodongfun.getHDData('SYSTEM', hdid, keys='_id,arr')
    if not _systemData:
        _systemData = hdinfo['data']
        _systemData.update({'val':0,'gotarr':[]})
        g.m.huodongfun.setHDData('SYSTEM', hdid, _systemData)

    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _nt = g.C.NOW()
    # 未到领取时间
    if _nt > hdinfo['etime']:
        return _retVal

    # 充值金额满足某一档
    for ele in _systemData['arr']:
        if _valInfo['val'] >= ele['val'] and (ele['val'] not in _valInfo.get('gotarr',[])) and ele['buynum'] > 0:
            _retVal = True
            break

    return _retVal

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    hdInfo = g.m.huodongfun.getHuodongInfoById(hdid, keys='_id,data', iscache=0)
    hdInfoData = hdInfo['data']
    val = g.getGud(uid)['lv']
    setData = {'gotarr': [], 'val': val, 'lasttime': g.C.NOW()}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


if __name__ == '__main__':
    getHongdian()