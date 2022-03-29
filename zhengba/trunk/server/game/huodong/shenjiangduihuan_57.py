#! /usr/bin/python
# -*-coding:utf-8-*-
"""
神将兑换

"""
if __name__ == '__main__':
    import sys
    sys.path.append('..')


htype = 57
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,send')
    _retVal = {"info":hdinfo['data'],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = abs(int(kwargs['idx']))
    act = kwargs['act']
    _num = abs(int(kwargs['wxcode']))
    hdid = hdinfo['hdid']
    hdDataArr = hdinfo['data']['duihuan'][idx]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _buyNum = hdDataArr['buynum']
    # 购买次数不足
    if _buyNum != -1 and _buyNum < hdData['gotarr'].get(str(idx), 0) + _num:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _need = hdDataArr['need']
    _need = _need * _num
    _need = g.mergePrize(_need)
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
    g.delNeed(uid, _need, 1)
    # 设置购买次数
    if _buyNum != -1:
        g.m.huodongfun.setHDData(uid, hdid, {'$inc':{'gotarr.{}'.format(idx): _num}})
    _prize = hdDataArr['p'] * _num
    _prize = g.mergePrize(_prize)
    _sendData = g.getPrizeRes(uid, _prize,{"act": "hdgetprize", "hdid": hdid, "num": hdData['gotarr'].get(str(idx), 0)+1,'idx':idx})
    g.sendUidChangeInfo(uid, _sendData)
    _rData["prize"] = _prize
    return _rData


def getHongdian(uid, hdid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,send')
    # 掉落结束后要提醒兑换
    if hdinfo['rtime'] <= g.C.NOW() and 'send' not in hdData:
        _title = hdinfo['data']['email']['title']
        _content = hdinfo['data']['email']['content']
        g.m.emailfun.sendEmail(uid,1,_title,_content)
        g.m.huodongfun.setHDData(uid, hdid, {'send': 1})


def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {"val": 0, "gotarr": {}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("2")
    hdid = 1000
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a