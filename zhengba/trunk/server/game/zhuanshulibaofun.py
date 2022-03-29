#!/usr/bin/python
#coding:utf-8

import g

'''
专属礼包
'''

#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):

    # 判断是否开启
    _nt = g.C.NOW()
    hdinfo = g.mdb.find1("hdinfo", {"htype": 68, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    if not hdinfo:
        return
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,lasttime')
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _val = hdData["val"]
    if hdData["lasttime"] < _zt:
        gud = g.getGud(uid)
        _vip = gud["vip"]
        # 设置今天的vip等级
        g.m.huodongfun.setHDData(uid, hdid, {"val": _vip})
        _val = _vip

    for idx, i in enumerate(hdinfo['data']):
        if i['proid'] != act:
            continue
        if hdData['gotarr'].get(str(act), 0) >= i['maxnum']:
            g.success[orderid] = False
            return
        # 判断当前vip是否可以购买
        if not (i["viparea"][0] <= _val <= i["viparea"][1]):
            return

        _prize = i['prize']
        _send = g.getPrizeRes(uid, _prize, {'act': 'zhuanshulibao', 'proid': i['proid']})
        g.sendUidChangeInfo(uid, _send)
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'$inc': {'gotarr.{}'.format(act): 1}})
        break



g.event.on('chongzhi', onChongzhiSuccess)

if __name__ == "__main__":
    _prize = genrateCardPrize(1,1)
    print _prize